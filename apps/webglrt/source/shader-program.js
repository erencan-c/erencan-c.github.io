export { ShaderProgram };
// interface Dictionary<T> {
//     [Key: string]: T;
// };
function log_gl(gl, context = "") {
    let gl_error = gl.getError();
    if (gl_error !== 0) {
        alert(`Error in ${context}: ${gl_error}`);
        throw new Error(`Error in ${context}: ${gl_error}`);
    }
}
class ShaderProgram {
    static createShader(gl, shaderSource, shaderType, shaderFile) {
        if (!shaderFile) {
            if (shaderType === gl.VERTEX_SHADER) {
                shaderFile = "Vertex Shader";
            }
            else if (shaderType === gl.FRAGMENT_SHADER) {
                shaderFile = "Fragment Shader";
            }
            else {
                alert(`Undefined shader type: ${shaderType}`);
                throw new Error(`Undefined shader type: ${shaderType}`);
            }
        }
        const shader = gl.createShader(shaderType);
        if (shader === null) {
            let err = gl.getError();
            alert(`Shader creation error in "${shaderFile}": ${err}`);
            throw new Error(`Shader creation error in "${shaderFile}": ${err}`);
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorString = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            alert(`Shader compilation error in "${shaderFile}": ${errorString}`);
            throw new Error(`Shader compilation error in "${shaderFile}": ${errorString}`);
        }
        return shader;
    }
    program;
    constructor(gl, vertexShader, fragmentShader, scene) {
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
        const v = ShaderProgram.createShader(gl, vertexShader, gl.VERTEX_SHADER);
        const f = ShaderProgram.createShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, v);
        gl.attachShader(this.program, f);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const error_string = gl.getProgramInfoLog(this.program);
            gl.deleteProgram(this.program);
            alert(`Shader program linking error: ${error_string}`);
            throw new Error(`Shader program linking error: ${error_string}`);
        }
        // gl.deleteShader(v);
        // gl.deleteShader(f);
    }
    use(gl) {
        gl.useProgram(this.program);
    }
    getAttribLocation(gl, location) {
        return gl.getAttribLocation(this.program, location);
    }
    getUniformLocation(gl, location) {
        return gl.getUniformLocation(this.program, location);
    }
}
//# sourceMappingURL=shader-program.js.map