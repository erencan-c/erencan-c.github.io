#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;
out vec4 color;

uniform sampler2D image;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float phongExponent;

uniform vec3 cameraPosition;

uniform vec3 lightPosition;
uniform vec3 lightColor;

uniform bool checkerboard;

vec3 calculateDiffuse(vec3 L, float squareDistance) {
	return diffuseColor * lightColor * max(0.0, dot(normal, L)) / squareDistance;
}

vec3 calculateSpecular(vec3 L, float squareDistance) {
	vec3 V = cameraPosition - position;
	vec3 H = normalize(L + V);
	float angle = max(0.0, dot(H, normal));
	return specularColor * lightColor * pow(angle, phongExponent) / squareDistance;
}

void main() {
	vec3 L = lightPosition - position;
	float squareDistance = dot(L, L);
	L = L / sqrt(squareDistance);
	if(checkerboard) {
		bool shading = bool((int(floor(position.x * 0.5)) - int(floor(position.z * 0.5))) & 1);
		color = mix(vec4(0.0, 0.0, 0.196, 1.0), vec4(0.294, 0.497, 0.898, 1.0), bvec4(shading));
	} else {
		color =
			vec4(ambientColor + calculateDiffuse(L, squareDistance) + calculateSpecular(L, squareDistance), 1.0) +
			// Sample the image with reversed vertical coordinates. See `text.fs`.
			texture(image, vec2(uv.s, 1.0 - uv.t));
	}
}
