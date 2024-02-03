import { gl } from './globals.js';
export class Shader {
    program;
    fragment;
    vertex;
    // Storing the uniform locations in a dictionary should
    // improve the performance; however, I do not have a proof.
    uniformLocations;
    constructor(vertexSource, fragmentSource) {
        this.vertex = Shader.createShader(vertexSource, gl.VERTEX_SHADER);
        this.fragment = Shader.createShader(fragmentSource, gl.FRAGMENT_SHADER);
        this.program = Shader.createProgram(this.vertex, this.fragment);
        this.uniformLocations = {};
    }
    bind() {
        gl.useProgram(this.program);
    }
    unbind() {
        gl.useProgram(null);
    }
    sendMat4(name, mat) {
        if (!(name in this.uniformLocations)) {
            this.uniformLocations[name] = gl.getUniformLocation(this.program, name);
        }
        gl.uniformMatrix4fv(this.uniformLocations[name], false, mat);
    }
    sendVec2(name, vec) {
        if (!(name in this.uniformLocations)) {
            this.uniformLocations[name] = gl.getUniformLocation(this.program, name);
        }
        gl.uniform2f(this.uniformLocations[name], vec[0], vec[1]);
    }
    sendVec3(name, vec) {
        if (!(name in this.uniformLocations)) {
            this.uniformLocations[name] = gl.getUniformLocation(this.program, name);
        }
        gl.uniform3f(this.uniformLocations[name], vec[0], vec[1], vec[2]);
    }
    sendFloat(name, num) {
        if (!(name in this.uniformLocations)) {
            this.uniformLocations[name] = gl.getUniformLocation(this.program, name);
        }
        gl.uniform1f(this.uniformLocations[name], num);
    }
    sendBool(name, val) {
        if (!(name in this.uniformLocations)) {
            this.uniformLocations[name] = gl.getUniformLocation(this.program, name);
        }
        gl.uniform1i(this.uniformLocations[name], Number(val));
    }
    static createShader(source, type) {
        // Create a shader object. This is actually pretty similar to an object file
        // (.o file) in C or C++, storing the compiled code and proper information
        // for further linking.
        const shader = gl.createShader(type);
        // Load the source to the driver.
        gl.shaderSource(shader, source);
        // Compile the shader source. Something like `gcc -c source -o shader`.
        gl.compileShader(shader);
        // Check for error.
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorString = `Error in ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader compilation:\n${gl.getShaderInfoLog(shader)}`;
            gl.deleteShader(shader);
            console.error(errorString);
            throw new Error(errorString);
        }
        return shader;
    }
    static createProgram(vertexShader, fragmentShader) {
        // Create a program object. This is similar to an executable or dynamic library (DLL).
        const program = gl.createProgram();
        // `gcc vertexShader fragmentShader -o program`
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        // Check for error.
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const errorString = `Error in shader linkage\n${gl.getProgramInfoLog(program)}`;
            gl.deleteProgram(program);
            console.error(errorString);
            throw new Error(errorString);
        }
        return program;
    }
}
//# sourceMappingURL=Shader.js.map