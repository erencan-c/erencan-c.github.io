"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
var Camera = /** @class */ (function () {
    function Camera() {
    }
    return Camera;
}());
var Material = /** @class */ (function () {
    function Material() {
    }
    return Material;
}());
var Scene = /** @class */ (function () {
    function Scene(gl, xml_object) {
        this.backgroundColor = new Float32Array(xml_object.querySelector('BackgroundColor').innerHTML.trim().split(/\s+/).map(parseFloat));
        this.shadowRayEpsilon = parseFloat(xml_object.querySelector('ShadowRayEpsilon').innerHTML.trim());
        this.maxRecursionDepth = parseFloat(xml_object.querySelector('MaxRecursionDepth').innerHTML.trim());
        var cam = xml_object.querySelector('Camera');
        this.camera = {
            'position': new Float32Array(cam.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'gaze': new Float32Array(cam.querySelector('Gaze').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'up': new Float32Array(cam.querySelector('Up').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'nearPlane': new Float32Array(cam.querySelector('NearPlane').innerHTML.trim().split(/\s+/).map(parseFloat)),
            'nearDistance': parseFloat(cam.querySelector('NearDistance').innerHTML.trim()),
        };
        var lights = xml_object.querySelector('Lights');
        this.ambient_light = new Float32Array(lights.querySelector('AmbientLight').innerHTML.trim().split(/\s+/).map(parseFloat));
        var light_positions = [];
        var light_intensities = [];
        lights.querySelectorAll('PointLight').forEach(function (light) {
            var pos = light.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat);
            var inten = light.querySelector('Intensity').innerHTML.trim().split(/\s+/).map(parseFloat);
            light_positions.push(pos[0]);
            light_positions.push(pos[1]);
            light_positions.push(pos[2]);
            light_intensities.push(inten[0]);
            light_intensities.push(inten[1]);
            light_intensities.push(inten[2]);
        });
        this.lightPositions = new Float32Array(light_positions);
        this.lightIntensities = new Float32Array(light_intensities);
        var materials = xml_object.querySelector('Materials');
        var ambient_reflectances = [];
        var diffuse_reflectances = [];
        var specular_reflectances = [];
        var reflectances = [];
        var refractances = [];
        var refractance_ratios = [];
        var phong_exponents = [];
        materials.querySelectorAll('Material').forEach(function (material) {
            var ambient = material.querySelector('AmbientReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            var diffuse = material.querySelector('DiffuseReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            var specular = material.querySelector('SpecularReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            var reflect = material.querySelector('MirrorReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
            var hasRefract = material.querySelector('Refractance') !== null;
            var refract = hasRefract ? parseFloat(material.querySelector('Refractance').innerHTML.trim()) : 1.0;
            var refract_ratio = hasRefract ? material.querySelector('RefractanceRatio').innerHTML.trim().split(/\s+/).map(parseFloat) : [0, 0, 0];
            var phong = parseFloat(material.querySelector('PhongExponent').innerHTML.trim());
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
        this.vertexData = new Float32Array(xml_object.querySelector('VertexData').innerHTML.trim().split(/\s+/).map(parseFloat));
        var m_id = [];
        var v_id = [];
        var objects = xml_object.querySelector('Objects');
        objects.querySelectorAll('Mesh').forEach(function (mesh) {
            var material_id = parseFloat(mesh.querySelector('Material').innerHTML) - 1;
            var vertex_ids = mesh.querySelector('Faces').innerHTML.trim().split(/\s+/).map(function (v) { return parseFloat(v) - 1; });
            for (var i = 0; i < vertex_ids.length / 3; i++) {
                m_id.push(material_id);
            }
            for (var i = 0; i < vertex_ids.length; i++) {
                v_id.push(vertex_ids[i]);
            }
        });
        this.materialIds = new Int32Array(m_id);
        this.vertices = new Int32Array(v_id);
        var s_m = [];
        var s_c = [];
        var s_r = [];
        objects.querySelectorAll('Sphere').forEach(function (sphere) {
            var material_id = parseFloat(sphere.querySelector('Material').innerHTML) - 1;
            var center_id = parseFloat(sphere.querySelector('Center').innerHTML) - 1;
            var radius = parseFloat(sphere.querySelector('Radius').innerHTML);
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
    Scene.prototype.sendScene = function (gl, shader) {
        gl.uniform3f(shader.getUniformLocation(gl, 'ambient_light'), this.ambient_light[0], this.ambient_light[1], this.ambient_light[2]);
        gl.uniform3f(shader.getUniformLocation(gl, 'background_color'), this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2]);
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.gaze'), this.camera.gaze[0], this.camera.gaze[1], this.camera.gaze[2]);
        gl.uniform1f(shader.getUniformLocation(gl, 'camera.near_distance'), this.camera.nearDistance);
        gl.uniform4f(shader.getUniformLocation(gl, 'camera.near_plane'), this.camera.nearPlane[0], this.camera.nearPlane[1], this.camera.nearPlane[2], this.camera.nearPlane[3]);
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.position'), this.camera.position[0], this.camera.position[1], this.camera.position[2]);
        gl.uniform3f(shader.getUniformLocation(gl, 'camera.up'), this.camera.up[0], this.camera.up[1], this.camera.up[2]);
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
    };
    return Scene;
}());
exports.Scene = Scene;
