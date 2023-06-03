export { Buffer };
function log_gl(gl, context = "") {
    let gl_error = gl.getError();
    if (gl_error !== 0) {
        throw new Error(`Error in ${context}: ${gl_error}`);
    }
}
class Buffer {
    buffer;
    array;
    constructor(gl, positions, shader) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        this.array = gl.createVertexArray();
        gl.bindVertexArray(this.array);
        console.log(positions);
        gl.enableVertexAttribArray(shader.getAttribLocation(gl, 'world_position'));
        gl.vertexAttribPointer(shader.getAttribLocation(gl, 'world_position'), 2, gl.FLOAT, false, 0, 0);
    }
    draw(gl, shader) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        shader.use(gl);
        gl.bindVertexArray(this.array);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
//# sourceMappingURL=buffer.js.map