import { ShaderProgram } from "./shader-program";

export { Scene }

class Camera {
    position: Float32Array;
    gaze: Float32Array;
    up: Float32Array;
    nearPlane: Float32Array;
    nearDistance: number;
}

class Material {
    ambient: Float32Array;
    diffuse: Float32Array;
    specular: Float32Array;
    reflect: Float32Array;
    refract: Float32Array;
    refractRatio: Float32Array;
    phong: Float32Array;
}

class Scene {
    backgroundColor: Float32Array;
    shadowRayEpsilon: number;
    maxRecursionDepth: number;
    camera: Camera;
    ambient_light: Float32Array;
    lightPositions: Float32Array;
    lightIntensities: Float32Array;
    materials: Material;
    vertexData: Float32Array;
    vertices: Int32Array;
    materialIds: Int32Array;
    sphereMaterials: Int32Array;
    sphereCenters: Int32Array;
    sphereRadii: Float32Array;

    constructor(gl: WebGL2RenderingContext, xml_object: XMLDocument) {
        this.backgroundColor = new Float32Array(xml_object.querySelector('BackgroundColor').innerHTML.trim().split(/\s+/).map(parseFloat));
        this.shadowRayEpsilon = parseFloat(xml_object.querySelector('ShadowRayEpsilon').innerHTML.trim());
        this.maxRecursionDepth = parseFloat(xml_object.querySelector('MaxRecursionDepth').innerHTML.trim());
        
        let cam = xml_object.querySelector('Camera');
        this.camera = {
            'position': new Float32Array(cam.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'gaze': new Float32Array(cam.querySelector('Gaze').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'up': new Float32Array(cam.querySelector('Up').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'nearPlane': new Float32Array(cam.querySelector('NearPlane').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'nearDistance': parseFloat(cam.querySelector('NearDistance').innerHTML.trim()),
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
        this.lightPositions = new Float32Array(light_positions);
        this.lightIntensities = new Float32Array(light_intensities);
        
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
            let hasRefract = material.querySelector('Refractance') !== null;
            let refract = hasRefract ? parseFloat(material.querySelector('Refractance').innerHTML.trim()) : 1.0;
            let refract_ratio = hasRefract ? material.querySelector('RefractanceRatio').innerHTML.trim().split(/\s+/).map(parseFloat) : [0,0,0];
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
            'refractRatio': new Float32Array(refractance_ratios),
            'phong': new Float32Array(phong_exponents)
        };
        
        this.vertexData = new Float32Array (xml_object.querySelector('VertexData').innerHTML.trim().split(/\s+/).map(parseFloat));

        let m_id: number[] = [];
        let v_id: number[] = [];

        let objects = xml_object.querySelector('Objects');
        objects.querySelectorAll('Mesh').forEach(mesh => {
            let material_id = parseFloat(mesh.querySelector('Material').innerHTML) - 1;
            let vertex_ids = mesh.querySelector('Faces').innerHTML.trim().split(/\s+/).map(v => parseFloat(v) - 1);
            for(let i = 0; i < vertex_ids.length/3; i++) {
                m_id.push(material_id);
            }
            for(let i = 0; i < vertex_ids.length; i++) {
                v_id.push(vertex_ids[i]);
            }
        });
        
        this.materialIds = new Int32Array(m_id);
        this.vertices = new Int32Array(v_id);

        let s_m: number[] = [];
        let s_c: number[] = [];
        let s_r: number[] = [];

        objects.querySelectorAll('Sphere').forEach(sphere => {
            let material_id = parseFloat(sphere.querySelector('Material').innerHTML) - 1;
            let center_id = parseFloat(sphere.querySelector('Center').innerHTML) - 1;
            let radius = parseFloat(sphere.querySelector('Radius').innerHTML);

            s_m.push(material_id);
            s_c.push(center_id);
            s_r.push(radius);
        });

        console.log(this.vertices);
        console.log(s_m);
        console.log(s_c);
        console.log(s_r);
        
        this.sphereMaterials = new Int32Array(s_m);
        this.sphereCenters = new Int32Array(s_c);
        this.sphereRadii = new Float32Array(s_r);

        console.log(this);
    }

    sendScene(gl: WebGL2RenderingContext, shader: ShaderProgram) {
        gl.uniform3f(shader.getUniformLocation(gl, 'ambient_light'),
            this.ambient_light[0],
            this.ambient_light[1],
            this.ambient_light[2]
        );
        
        gl.uniform3f(shader.getUniformLocation(gl, 'background_color'),
            this.backgroundColor[0],
            this.backgroundColor[1],
            this.backgroundColor[2]
        );
        
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.gaze'),
            this.camera.gaze[0],
            this.camera.gaze[1],
            this.camera.gaze[2]
        );
        
        gl.uniform1f(shader.getUniformLocation(gl, 'camera.near_distance'),
            this.camera.nearDistance
        );
        
        gl.uniform4f(shader.getUniformLocation(gl, 'camera.near_plane'),
            this.camera.nearPlane[0],
            this.camera.nearPlane[1],
            this.camera.nearPlane[2],
            this.camera.nearPlane[3]
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
        
        gl.uniform3fv(shader.getUniformLocation(gl, 'light_intensities'), this.lightIntensities);
        gl.uniform3fv(shader.getUniformLocation(gl, 'light_positions'), this.lightPositions);
        
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_ambient'), this.materials.ambient);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_diffuse'), this.materials.diffuse);
        gl.uniform1fv(shader.getUniformLocation(gl, 'material_phong'), this.materials.phong);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_reflect'), this.materials.reflect);
        gl.uniform1fv(shader.getUniformLocation(gl, 'material_refract'), this.materials.refract);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_refract_ratios'), this.materials.refractRatio);
        gl.uniform3fv(shader.getUniformLocation(gl, 'material_specular'), this.materials.specular);
        
        gl.uniform3fv(shader.getUniformLocation(gl, 'vertex_data'), this.vertexData);
        gl.uniform1iv(shader.getUniformLocation(gl, 'vertices'), this.vertices);
        gl.uniform1iv(shader.getUniformLocation(gl, 'material_ids'), this.materialIds);
        
        gl.uniform1iv(shader.getUniformLocation(gl, 'sphere_materials'), this.sphereMaterials);
        gl.uniform1iv(shader.getUniformLocation(gl, 'sphere_centers'), this.sphereCenters);
        gl.uniform1fv(shader.getUniformLocation(gl, 'sphere_radii'), this.sphereRadii);
    }
}