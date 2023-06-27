import { ShaderProgram } from "./shader-program";

export { Scene }

class Camera {
    position: Float32Array;
    gaze: Float32Array;
    up: Float32Array;
    near_plane: Float32Array;
    near_distance: number;
}

class Material {
    ambient: Float32Array;
    diffuse: Float32Array;
    specular: Float32Array;
    reflect: Float32Array;
    refract: Float32Array;
    refract_ratio: Float32Array;
    phong: Float32Array;
}

class Scene {
    background_color: Float32Array;
    shadow_ray_epsilon: number;
    max_recursion_depth: number;
    camera: Camera;
    ambient_light: Float32Array;
    light_positions: Float32Array;
    light_intensities: Float32Array;
    materials: Material;
    vertices: Float32Array;
    material_ids: Int32Array;
    sphere_materials: Int32Array;
    sphere_centers: Float32Array;
    sphere_radii: Float32Array;


    constructor(gl: WebGL2RenderingContext, xml_object: XMLDocument) {
        this.background_color = new Float32Array(xml_object.querySelector('BackgroundColor').innerHTML.trim().split(/\s+/).map(parseFloat));
        this.shadow_ray_epsilon = parseFloat(xml_object.querySelector('ShadowRayEpsilon').innerHTML.trim());
        this.max_recursion_depth = parseFloat(xml_object.querySelector('MaxRecursionDepth').innerHTML.trim());
        
        let cam = xml_object.querySelector('Camera');
        this.camera = {
            'position': new Float32Array(cam.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'gaze': new Float32Array(cam.querySelector('Gaze').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'up': new Float32Array(cam.querySelector('Up').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'near_plane': new Float32Array(cam.querySelector('NearPlane').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'near_distance': parseFloat(cam.querySelector('NearDistance').innerHTML.trim()),
        }
        
        let lights = xml_object.querySelector('Lights');
        this.ambient_light = new Float32Array(lights.querySelector('AmbientLight').innerHTML.trim().split(/\s+/).map(parseFloat));
        let light_positions = [];
        let light_intensities = [];
        lights.querySelectorAll('PointLight').forEach(light => {
            let pos = light.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat);
            let inten = light.querySelector('Intensity').innerHTML.trim().split(/\s+/).map(parseFloat);
            light_positions.push(pos[0]);
            light_positions.push(pos[1]);
            light_positions.push(pos[2]);
            light_intensities.push(inten[0]);
            light_intensities.push(inten[1]);
            light_intensities.push(inten[2]);
        });
        this.light_positions = new Float32Array(light_positions);
        this.light_intensities = new Float32Array(light_intensities);
        
        let materials = xml_object.querySelector('Materials');
        let ambient_reflectances = [];
        let diffuse_reflectances = [];
        let specular_reflectances = [];
        let reflectances = [];
        let refractances = [];
        let refractance_ratios = [];
        let phong_exponents = [];
        materials.querySelectorAll('Material').forEach(material => {
            let ambient = material.querySelector('AmbientReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            let diffuse = material.querySelector('DiffuseReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            let specular = material.querySelector('SpecularReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            let reflect = material.querySelector('MirrorReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            let refract = parseFloat(material.querySelector('Refractance').innerHTML.trim());
            let refract_ratio = material.querySelector('RefractanceRatio').innerHTML.trim().split(/\s+/).map(parseFloat);
            let phong = parseFloat(material.querySelector('PhongExponent').innerHTML.trim());
            
            ambient_reflectances.push(ambient[0]);
            ambient_reflectances.push(ambient[1]);
            ambient_reflectances.push(ambient[2]);
            diffuse_reflectances.push(diffuse[0]);
            diffuse_reflectances.push(diffuse[1]);
            diffuse_reflectances.push(diffuse[2]);
            specular_reflectances.push(specular[0]);
            specular_reflectances.push(specular[1]);
            specular_reflectances.push(specular[2]);
            reflectances.push(reflect[0]);
            reflectances.push(reflect[1]);
            reflectances.push(reflect[2]);
            refractance_ratios.push(refract_ratio[0]);
            refractance_ratios.push(refract_ratio[1]);
            refractance_ratios.push(refract_ratio[2]);
            refractances.push(refract);
            phong_exponents.push(phong);
        });
        this.materials = {
            'ambient': new Float32Array(ambient_reflectances),
            'diffuse': new Float32Array(diffuse_reflectances),
            'specular': new Float32Array(specular_reflectances),
            'reflect': new Float32Array(reflectances),
            'refract': new Float32Array(refractances),
            'refract_ratio': new Float32Array(refractance_ratios),
            'phong': new Float32Array(phong_exponents)
        };
        
        this.vertices = new Float32Array (xml_object.querySelector('VertexData').innerHTML.trim().split(/\s+/).map(parseFloat));
        
        let material_ids = [
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            2,
            2
        ];
        let vertex_ids = [
            1, 2, 6,
            6, 5, 1,
            5, 6, 7,
            7, 8, 5,
            7, 3, 4,
            4, 8, 7,
            8, 4, 1,
            8, 1, 5,
            2, 3, 7,
            2, 7, 6
        ];
        
        let vertices = [];
        vertex_ids.forEach(id => {
            vertices.push(this.vertices[3*(id-1)]);
            vertices.push(this.vertices[3*(id-1) + 1]);
            vertices.push(this.vertices[3*(id-1) + 2]);
        });
        
        this.vertices = new Float32Array(vertices);
        this.material_ids = new Int32Array(material_ids);
        
        let sphere_materials = [3,4];
        let sphere_centers = [5,-6,-1, -5,-6,-5];
        let sphere_radii = [4,4];
        
        this.sphere_materials = new Int32Array(sphere_materials);
        this.sphere_centers = new Float32Array(sphere_centers);
        this.sphere_radii = new Float32Array(sphere_radii);
    }

    send_scene(gl: WebGL2RenderingContext, shader: ShaderProgram) {
        gl.uniform3f(shader.getUniformLocation(gl, 'ambient_light'),
            this.ambient_light[0],
            this.ambient_light[1],
            this.ambient_light[2]
        );
        
        gl.uniform3f(shader.getUniformLocation(gl, 'background_color'),
            this.background_color[0],
            this.background_color[1],
            this.background_color[2]
        );
        
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.gaze'),
            this.camera.gaze[0],
            this.camera.gaze[1],
            this.camera.gaze[2]
        );
        
        gl.uniform1f(shader.getUniformLocation(gl, 'camera.near_distance'),
            this.camera.near_distance
        );
        
        gl.uniform4f(shader.getUniformLocation(gl, 'camera.near_plane'),
            this.camera.near_plane[0],
            this.camera.near_plane[1],
            this.camera.near_plane[2],
            this.camera.near_plane[3]
        );
        
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.position'),
            this.camera.position[0],
            this.camera.position[1],
            this.camera.position[2]
        );
        
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.up'),
            this.camera.up[0],
            this.camera.up[1],
            this.camera.up[2]
        );
        
        gl.uniform3fv(shader.getUniformLocation(gl, 'light_intensities'), this.light_intensities);
        gl.uniform3fv(shader.getUniformLocation(gl, 'light_positions'), this.light_positions);
        
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_ambient'), this.materials.ambient);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_diffuse'), this.materials.diffuse);
        gl.uniform1fv(shader.getUniformLocation(gl, 'material_phong'), this.materials.phong);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_reflect'), this.materials.reflect);
        gl.uniform1fv(shader.getUniformLocation(gl, 'material_refract'), this.materials.refract);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_refract_ratios'), this.materials.refract_ratio);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_specular'), this.materials.specular);
        
        gl.uniform3fv(shader.getUniformLocation(gl, 'vertices'), this.vertices);
        
        gl.uniform1iv(shader.getUniformLocation(gl, 'material_ids'), this.material_ids);
        
        gl.uniform1iv(shader.getUniformLocation(gl, 'sphere_materials'), this.sphere_materials);
        gl.uniform3fv(shader.getUniformLocation(gl, 'sphere_centers'), this.sphere_centers);
        gl.uniform1fv(shader.getUniformLocation(gl, 'sphere_radii'), this.sphere_radii);
    }
}