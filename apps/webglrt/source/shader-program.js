"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaderProgram = void 0;
// interface Dictionary<T> {
//     [Key: string]: T;
// };
function log_gl(gl, context) {
    if (context === void 0) { context = ""; }
    var gl_error = gl.getError();
    if (gl_error !== 0) {
        alert("Error in ".concat(context, ": ").concat(gl_error));
        throw new Error("Error in ".concat(context, ": ").concat(gl_error));
    }
}
var ShaderProgram = /** @class */ (function () {
    function ShaderProgram(gl, vertexShader, fragmentShader, scene) {
        vertexShader = vertexShader.replace(/\$LIGHT_COUNT/, (scene.lightPositions.length / 3).toString())
            .replace(/\$MATERIAL_COUNT/, scene.materials.phong.length.toString())
            .replace(/\$VERTEX_COUNT/, (scene.vertices.length === 0 ? 1 : scene.vertices.length / 3).toString())
            .replace(/\$SPHERE_COUNT/, (scene.sphereRadii.length === 0 ? 1 : scene.sphereRadii.length).toString())
            .replace(/\$MAX_RECURSION_DEPTH/, scene.maxRecursionDepth.toString())
            .replace(/\$SHADOW_RAY_EPSILON/, scene.shadowRayEpsilon.toString())
            .replace(/\$HAS_TRIANGLE/, Number(scene.vertices.length !== 0).toString())
            .replace(/\$HAS_SPHERE/, Number(scene.sphereRadii.length !== 0).toString());
        fragmentShader = fragmentShader.replace(/\$LIGHT_COUNT/, (scene.lightPositions.length / 3).toString())
            .replace(/\$MATERIAL_COUNT/, scene.materials.phong.length.toString())
            .replace(/\$VERTEX_COUNT/, (scene.vertexData.length / 3).toString())
            .replace(/\$SPHERE_COUNT/, (scene.sphereRadii.length === 0 ? 1 : scene.sphereRadii.length).toString())
            .replace(/\$MAX_RECURSION_DEPTH/, scene.maxRecursionDepth.toString())
            .replace(/\$SHADOW_RAY_EPSILON/, scene.shadowRayEpsilon.toString())
            .replace(/\$HAS_TRIANGLE/, Number(scene.vertices.length !== 0).toString())
            .replace(/\$HAS_SPHERE/, Number(scene.sphereRadii.length !== 0).toString())
            .replace(/\$FACE_VERTEX_COUNT/, Number(scene.vertices.length === 0 ? 3 : scene.vertices.length).toString());
        console.log(fragmentShader);
        var v = ShaderProgram.createShader(gl, vertexShader, gl.VERTEX_SHADER);
        var f = ShaderProgram.createShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, v);
        gl.attachShader(this.program, f);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error_string = gl.getProgramInfoLog(this.program);
            gl.deleteProgram(this.program);
            alert("Shader program linking error: ".concat(error_string));
            throw new Error("Shader program linking error: ".concat(error_string));
        }
        // gl.deleteShader(v);
        // gl.deleteShader(f);
    }
    ShaderProgram.createShader = function (gl, shaderSource, shaderType, shaderFile) {
        if (!shaderFile) {
            if (shaderType === gl.VERTEX_SHADER) {
                shaderFile = "Vertex Shader";
            }
            else if (shaderType === gl.FRAGMENT_SHADER) {
                shaderFile = "Fragment Shader";
            }
            else {
                alert("Undefined shader type: ".concat(shaderType));
                throw new Error("Undefined shader type: ".concat(shaderType));
            }
        }
        var shader = gl.createShader(shaderType);
        if (shader === null) {
            var err = gl.getError();
            alert("Shader creation error in \"".concat(shaderFile, "\": ").concat(err));
            throw new Error("Shader creation error in \"".concat(shaderFile, "\": ").concat(err));
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var errorString = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            alert("Shader compilation error in \"".concat(shaderFile, "\": ").concat(errorString));
            throw new Error("Shader compilation error in \"".concat(shaderFile, "\": ").concat(errorString));
        }
        return shader;
    };
    ShaderProgram.prototype.use = function (gl) {
        gl.useProgram(this.program);
    };
    ShaderProgram.prototype.getAttribLocation = function (gl, location) {
        return gl.getAttribLocation(this.program, location);
    };
    ShaderProgram.prototype.getUniformLocation = function (gl, location) {
        return gl.getUniformLocation(this.program, location);
    };
    return ShaderProgram;
}());
exports.ShaderProgram = ShaderProgram;
