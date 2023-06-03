export {ShaderProgram};

// interface Dictionary<T> {
//     [Key: string]: T;
// };

function log_gl(gl: WebGL2RenderingContext, context: string = "") {
    let gl_error = gl.getError();
    if(gl_error !== 0) {
        throw new Error(`Error in ${context}: ${gl_error}`);
    }
}

class ShaderProgram {
    private static createShader(gl: WebGL2RenderingContext, shaderSource: string, shaderType: number, shaderFile?: string): WebGLShader {
        if(!shaderFile) {
            if(shaderType === gl.VERTEX_SHADER) {
                shaderFile = "Vertex Shader";
            } else if(shaderType === gl.FRAGMENT_SHADER) {
                shaderFile = "Fragment Shader";
            } else {
                throw new Error(`Undefined shader type: ${shaderType}`);
            }
        }
        
        const shader = gl.createShader(shaderType);
        if(shader === null) {
            throw new Error(`Shader creation error in "${shaderFile}": ${gl.getError()}`);
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorString = gl.getShaderInfoLog(shader) as string;
            gl.deleteShader(shader);
            throw new Error(`Shader compilation error in "${shaderFile}": ${errorString}`);
        }
        return shader;
    }
    
    private program: WebGLProgram;
    // private cachedAttribLocations: Dictionary<number> = {};

    constructor(gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string = "") {
        const v = ShaderProgram.createShader(gl, vertexShader, gl.VERTEX_SHADER);
        const f = ShaderProgram.createShader(gl, fragmentShader, gl.FRAGMENT_SHADER);

        console.log(vertexShader);
        console.log(fragmentShader);

        this.program = gl.createProgram();
        gl.attachShader(this.program, v);
        gl.attachShader(this.program, f);
        gl.linkProgram(this.program);

        if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const error_string = gl.getProgramInfoLog(this.program);
            gl.deleteProgram(this.program);
            throw new Error(`Shader program linking error: ${error_string}`);
        }

        // gl.deleteShader(v);
        // gl.deleteShader(f);
    }

    use(gl: WebGL2RenderingContext) {
        gl.useProgram(this.program);
    }

    getAttribLocation(gl: WebGL2RenderingContext, location: string): number {
        return gl.getAttribLocation(this.program, location);
    }

    getUniformLocation(gl: WebGL2RenderingContext, location: string): WebGLUniformLocation {
        return gl.getUniformLocation(this.program, location);
    }
}
