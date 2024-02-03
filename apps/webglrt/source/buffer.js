"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buffer = void 0;
function log_gl(gl, context) {
    if (context === void 0) { context = ""; }
    var gl_error = gl.getError();
    if (gl_error !== 0) {
        alert("Error in ".concat(context, ": ").concat(gl_error));
        throw new Error("Error in ".concat(context, ": ").concat(gl_error));
    }
}
var Buffer = /** @class */ (function () {
    function Buffer(gl, positions, shader) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        this.array = gl.createVertexArray();
        gl.bindVertexArray(this.array);
        gl.enableVertexAttribArray(shader.getAttribLocation(gl, 'world_position'));
        gl.vertexAttribPointer(shader.getAttribLocation(gl, 'world_position'), 2, gl.FLOAT, false, 0, 0);
    }
    Buffer.prototype.draw = function (gl, shader) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        shader.use(gl);
        gl.bindVertexArray(this.array);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    return Buffer;
}());
exports.Buffer = Buffer;
