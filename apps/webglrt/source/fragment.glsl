#version 300 es
precision highp float;

// #define LIGHT_COUNT 1
// #define MATERIAL_COUNT 6
// #define VERTEX_COUNT 30
// #define SPHERE_COUNT 2
// #define MAX_RECURSION_DEPTH 3
// #define SHADOW_RAY_EPSILON 1e-4
#define TRIANGLE_EPSILON 1e-6
#define DEBUG_COLOR vec4(1.0f, 0.0f, 1.0f, 1.0f)
#define CAST(start, direction, t) ((start) + (direction)*(t))

#define LIGHT_COUNT $LIGHT_COUNT
#define MATERIAL_COUNT $MATERIAL_COUNT
#define VERTEX_COUNT $VERTEX_COUNT
#define FACE_VERTEX_COUNT $FACE_VERTEX_COUNT
#define SPHERE_COUNT $SPHERE_COUNT
#define MAX_RECURSION_DEPTH $MAX_RECURSION_DEPTH
#define SHADOW_RAY_EPSILON $SHADOW_RAY_EPSILON
#define HAS_TRIANGLE $HAS_TRIANGLE
#define HAS_SPHERE $HAS_SPHERE

in vec4 vertex_position;
out vec4 color;

uniform vec3 ambient_light;
uniform vec3 background_color;

struct Camera {
	vec3 gaze;
	float near_distance;
	vec4 near_plane;
	vec3 position;
	vec3 up;
};

uniform Camera camera;
uniform vec3 light_intensities[LIGHT_COUNT];
uniform vec3 light_positions[LIGHT_COUNT];

uniform vec3 material_ambient[MATERIAL_COUNT];
uniform vec3 material_diffuse[MATERIAL_COUNT];
uniform float material_phong[MATERIAL_COUNT];
uniform vec3 material_reflect[MATERIAL_COUNT];
uniform float material_refract[MATERIAL_COUNT];
uniform vec3 material_refract_ratios[MATERIAL_COUNT];
uniform vec3 material_specular[MATERIAL_COUNT];

uniform vec3 vertex_data[VERTEX_COUNT];
uniform int vertices[FACE_VERTEX_COUNT];
uniform int material_ids[FACE_VERTEX_COUNT/3];

uniform int sphere_materials[SPHERE_COUNT];
uniform int sphere_centers[SPHERE_COUNT];
uniform float sphere_radii[SPHERE_COUNT];

bool sphere_get_collision(int sphere_index, vec3 ray_start, vec3 ray_direction, out float t_out) {
	vec3 C = vertex_data[sphere_centers[sphere_index]];
	float r = sphere_radii[sphere_index];
	vec3 o = ray_start;
	vec3 u = ray_direction;
	
	float a = dot(u,u);
	vec3 oc = o - C;
	float b = 2.0f * dot(u, oc);
	float c = dot(oc,oc) - (r*r);
	
	float discriminant = (b*b) - (4.0f*a*c);
	float t = ((-b) - sqrt(discriminant)) / (2.0f * a);
	if(t < 0.0f) {
		t_out = 0.0f;
		return false;
	}
	t_out = t;
	return true;
}

vec3 sphere_get_normal(int sphere_index, vec3 point) {
	return (point - vertex_data[sphere_centers[sphere_index]]) / sphere_radii[sphere_index];
}

bool triangle_get_collision(int face_id, vec3 ray_start, vec3 ray_direction, out float t_out) {
	t_out = 0.0f;

	vec3 vertex0 = vertex_data[vertices[3*face_id]];
	vec3 vertex1 = vertex_data[vertices[3*face_id + 1]];
	vec3 vertex2 = vertex_data[vertices[3*face_id + 2]];
	
	vec3 edge1 = vertex1 - vertex0;
	vec3 edge2 = vertex2 - vertex0;
	
	vec3 h = cross(ray_direction, edge2);
	float a = dot(edge1, h);
	
	if(a > -TRIANGLE_EPSILON && a < TRIANGLE_EPSILON) {
		return false;
	}
	float f = 1.0f / a;
	vec3 s = ray_start - vertex0;
	float u = f * dot(s, h);
	if(u < 0.0f || u > 1.0f) {
		return false;
	}
	
	vec3 q = cross(s, edge1);
	float v = f * dot(ray_direction, q);
	if(v < 0.0f || u + v > 1.0f) {
		return false;
	}
	float t = f * dot(edge2, q);
	if(t > TRIANGLE_EPSILON) {
		t_out = t;
		return true;
	}
	return false;
}

bool get_collision(vec3 ray_start, vec3 ray_direction, out float t_out, out int id_out, out bool is_sphere, out vec3 normal) {
	float t = -1.0f;
	int id = 0;
	is_sphere = false;
	id_out = 0;
	normal = vec3(0.0f, 0.0f, 0.0f);
	bool found = false;
	#if HAS_SPHERE
		for(int i = 0; i < SPHERE_COUNT; i++) {
			float t_tmp = 0.0f;
			bool does_intersect = sphere_get_collision(i, ray_start, ray_direction, t_tmp);
			if(does_intersect && t_tmp > 0.0f && (t_tmp < t || t < 0.0f)) {
				is_sphere = true;
				t = t_tmp;
				id_out = i;
				normal = sphere_get_normal(i, ray_start + t*ray_direction);
				found = true;
			}
		}
	#endif
	#if HAS_TRIANGLE
		for(int i = 0; i < FACE_VERTEX_COUNT/3; i++) {
			float t_tmp = 0.0f;
			bool does_intersect = triangle_get_collision(i, ray_start, ray_direction, t_tmp);
			if(does_intersect && t_tmp > 0.0f && (t_tmp < t || t < 0.0f)) {
				is_sphere = false;
				t = t_tmp;
				id_out = i;
				vec3 vertex0 = vertex_data[vertices[3*i]];
				vec3 vertex1 = vertex_data[vertices[3*i + 1]];
				vec3 vertex2 = vertex_data[vertices[3*i + 2]];
				normal = normalize(cross(vertex1-vertex0, vertex2-vertex0));
				found = true;
			}
		}
	#endif
	if(found) {
		t_out = t;
		return true;
	}
	return false;
}

vec3 is_shadowed(vec3 ray_start, vec3 ray_direction) {
	float t = 0.0;
	vec3 ret = vec3(1.0f, 1.0f, 1.0f);
	#if HAS_SPHERE
	for(int i = 0; i < SPHERE_COUNT; i++) {
		bool does_intersect = sphere_get_collision(i, ray_start, ray_direction, t);
		if(does_intersect && 0.0f < t && t < 1.0f) {
			ret *= material_refract_ratios[sphere_materials[i]];
		}
	}
	#endif
	#if HAS_TRIANGLE
	for(int i = 0; i < FACE_VERTEX_COUNT/3; i++) {
		bool does_intersect = triangle_get_collision(i, ray_start, ray_direction, t);
		if(does_intersect && 0.0f < t && t < 1.0f) {
			ret *= material_refract_ratios[material_ids[i]];
		}
	}
	#endif
	return ret;
}

vec3 diffuse_shading(vec3 shadow_ray_start, vec3 shadow_ray_direction, vec3 lh, vec3 zor, vec3 norm, float r2, int material_id) {
	return material_diffuse[material_id] * max(0.0f, dot(norm, normalize(lh))) * zor;
}

vec3 specular_shading(	vec3 shadow_ray_start,
						vec3 shadow_ray_direction,
						vec3 lh,
						vec3 zor,
						vec3 norm,
						float r2,
						int material_id,
						vec3 incoming_ray_start,
						vec3 incoming_ray_direction) {
	vec3 h = normalize(normalize(shadow_ray_direction) - normalize(incoming_ray_direction));
	return material_specular[material_id] * pow(max(0.0f, dot(norm, h)), material_phong[material_id]) * zor;
}

void do_shading(vec3 hit_point, vec3 norm, int material_id, vec3 incoming_ray_start, vec3 incoming_ray_direction, inout vec3 diffuse, inout vec3 specular) {
	for(int i = 0; i < LIGHT_COUNT; i++) {
		vec3 shadow_ray_start = hit_point;
		vec3 shadow_ray_direction = light_positions[i] - shadow_ray_start;
		vec3 shadow_amount = is_shadowed(shadow_ray_start, shadow_ray_direction);
		vec3 lh = shadow_ray_direction;
		float r2 = dot(lh, lh);
		vec3 zor = light_intensities[i]/r2;
		diffuse += diffuse_shading(shadow_ray_start, shadow_ray_direction, lh, zor, norm, r2, material_id)*shadow_amount;
		specular += specular_shading(shadow_ray_start, shadow_ray_direction, lh, zor, norm, r2, material_id, incoming_ray_start, incoming_ray_direction)*shadow_amount;
	}
}

#define START 0
#define REFLECT 1
#define REFRACT 2

struct CallStackEntry {
	// Instruction "pointer"
	int recurse_place;

	// Arguments
	vec3 ray_start;
	vec3 ray_direction;
	vec3 amount;
	float eta;

	// Local variables
	int material;
	vec3 hit_point;
	vec3 normal;
	vec3 reflected_ray_direction;
	vec3 refracted_ray_direction;
};

CallStackEntry call_stack[MAX_RECURSION_DEPTH];
int call_stack_position = 0;

bool get_hit_point(vec3 ray_start, vec3 ray_direction, out int material, out vec3 hit_point, out vec3 normal) {
	float t = 0.0;
	int obj_id = 0;
	bool is_sphere = false;
	vec3 norm = vec3(0.0f);
	bool ret = get_collision(ray_start, ray_direction, t, obj_id, is_sphere, norm);
	if(!ret) {
		material = 0;
		hit_point = vec3(0.0f);
		normal = vec3(0.0f);
		return false;
	}
	hit_point = CAST(ray_start, ray_direction, t) + norm*SHADOW_RAY_EPSILON;
	material = is_sphere ? sphere_materials[obj_id] : material_ids[obj_id];
	normal = norm;
	return true;
}

void shade(vec3 ray_start, vec3 ray_direction, int material, vec3 hit_point, vec3 normal, out vec3 diffuse_out, out vec3 specular_out, out vec3 ambient_out) {
	ambient_out = material_ambient[material] * ambient_light;
	do_shading(hit_point, normal, material, ray_start, ray_direction, diffuse_out, specular_out);
}

#define CUR (call_stack[call_stack_position-1])
#define NEXT (call_stack[call_stack_position])

void trace() {
	for(int i = 0; i < (1 << (MAX_RECURSION_DEPTH+3)); i++) {
		if(call_stack_position == 0) {
			break;
		}
		switch(CUR.recurse_place) {
		case START:
			if(!get_hit_point(CUR.ray_start, CUR.ray_direction, CUR.material, CUR.hit_point, CUR.normal)) {
				call_stack_position -= 1;
				break;
			}
			vec3 diffuse = vec3(0.0f);
			vec3 specular = vec3(0.0f);
			vec3 ambient = vec3(0.0f);
			shade(CUR.ray_start, CUR.ray_direction, CUR.material, CUR.hit_point, CUR.normal, diffuse, specular, ambient);
			CUR.normal = normalize(CUR.normal);
			CUR.ray_direction = normalize(CUR.ray_direction);
			color.rgb += (diffuse + specular + ambient) * CUR.amount / 256.0f;
			if(call_stack_position == MAX_RECURSION_DEPTH) {
				call_stack_position -= 1;
				break;
			}
			CUR.reflected_ray_direction = reflect(CUR.ray_direction, CUR.normal);
			CUR.refracted_ray_direction = refract(CUR.ray_direction, CUR.normal, CUR.eta/material_refract[CUR.material]);
			// color = vec4(CUR.eta/material_refract[CUR.material], 0.0f, 0.0f, 1.0f);
			CUR.recurse_place = REFLECT;
			NEXT.recurse_place = START;
			NEXT.ray_start = CUR.hit_point;
			NEXT.ray_direction = CUR.reflected_ray_direction;
			NEXT.amount = CUR.amount * material_reflect[CUR.material];
			NEXT.eta = CUR.eta;
			call_stack_position += 1;
			break;
		case REFLECT:
			CUR.recurse_place = REFRACT;
			NEXT.recurse_place = START;
			NEXT.ray_start = CUR.hit_point + 2.0f*CUR.refracted_ray_direction*SHADOW_RAY_EPSILON;
			NEXT.ray_direction = CUR.refracted_ray_direction;
			NEXT.amount = CUR.amount * material_refract_ratios[CUR.material];
			NEXT.eta = material_refract[CUR.material];
			call_stack_position += 1;
			break;
		case REFRACT:
			call_stack_position -= 1;
			break;
		}
	}
}

void main() {
	color = vec4(background_color, 1.0f);
    vec3 ray_position = vec3((vertex_position.xy)/2.0f + vec2(0.5f, 0.5f), mod(0.0f, 5.0f)/5.0f);
	vec2 near_size = vec2(camera.near_plane.y - camera.near_plane.x, camera.near_plane.w - camera.near_plane.z);
	vec2 ray_target = (((vertex_position.xy/2.0f)+0.5f) * near_size) + vec2(camera.near_plane.x, camera.near_plane.z);
	
	vec3 camera_right = cross(camera.gaze, camera.up);

	vec3 coord_vertical = ray_target.y*camera.up;
	vec3 coord_horizontal = ray_target.x*camera_right;

	vec3 ray_end = camera.position + (camera.gaze)*camera.near_distance + coord_vertical + coord_horizontal;
	vec3 ray_start = camera.position;
	vec3 ray_direction = normalize(ray_end - ray_start);
	// ray_start = ray_end;
	
	CallStackEntry current_entry = CallStackEntry(
		START,
		ray_start,
		ray_direction,
		vec3(1.0f, 1.0f, 1.0f),
		1.0f,
		0,
		vec3(0.0f),
		vec3(0.0f),
		vec3(0.0f),
		vec3(0.0f)
	);
	CallStackEntry pushed_entry;
	call_stack[call_stack_position] = current_entry;
	call_stack_position = 1;
	trace();
}
