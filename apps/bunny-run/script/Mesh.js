import { gl } from './globals.js';
import * as math from './math.js';
/**
 * Stride for meshes.
 * - 3 floats for position
 * - 3 floats for normal
 * - 2 floats for texture coordinates
 */
const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
export class Mesh {
    vao;
    texture;
    // `gl.drawElements` requires the number of drawn vertices.
    vertexCount;
    _translation;
    _rotation;
    _scaling;
    transformation = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
    ambientReflectance;
    diffuseReflectance;
    specularReflectance;
    shininess;
    // Whether a checkerboard pattern is used instead of usual lighting
    // calculations, pretty much a band-aid created for the ground
    checkerboard;
    active = true;
    constructor(attributes, indices, ambientReflectance, diffuseReflectance, specularReflectance, shininess, translation = new Float32Array([0, 0, 0]), rotation = new Float32Array([0, 0, 0]), scaling = new Float32Array([1, 1, 1]), checkerboard = false) {
        // Create the VAO.
        this.vao = gl.createVertexArray();
        // Bind it so that we can use it.
        gl.bindVertexArray(this.vao);
        // Create a VBO for the attributes/per-vertex-data of the mesh.
        const vbo = gl.createBuffer();
        // We use this buffer/data for the attributes, so we bind it to `gl.ARRAY_BUFFER`.
        // From here, everything we do to `gl.ARRAY_BUFFER` actually affect our vbo.
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        // We put our `attributes` to the buffer. Since we do not change it afterwards,
        // declaring it as `gl.STATIC_DRAW` may benefit us if the client/user's graphics
        // driver supports such an optimization. This is somewhat similar to declaring
        // a variable `const` in many languages.
        gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);
        // From here, we "format" our buffer. It is currently only a bunch of bits near each other.
        // For the first location (0), which is also declared in `mesh.vs` accordingly, we make it
        // 3 `gl.FLOAT`s. They are not normalized (actually, float attributes are not normalized
        // in any case if I know correctly, it is a parameter designed for integer attributes) and
        // reside in the memory with stride `stride`, declared at the start of the module as 8
        // floats, which is total size of the attributes for a _single_ vertex. For position, the
        // offset is 0 since a `stride` sized block directly starts with the position. Note that
        // each vertex uses a single `stride` sized block's information to be rendered, which are
        // processed in the vertex shader accordingly.
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
        // After 3 floats of the position attribute (which is the offset), we have normals, which are
        // bound to the attribute index 1. They are also 3 floats wide.
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        // The last attribute is the texture coordinates (uv coordinates), which are 2 floats.
        // Their offset is 6 floats since position attribute is 3, normal attribute is another 3
        // floats long.		
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
        // By default, VAOs come with no attributes enabled. We used 0, 1 and 2; hence, we enable
        // them. We may enable more but why do we create more work for our driver and GPU?
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        // Create an EBO for the draw order of the mesh vertices.
        const ebo = gl.createBuffer();
        // We use this buffer/data for the draw order of the elements/vertices, and `gl.ELEMENT_ARRAY_BUFFER`
        // is used for this purpose. From now on, everything we do to the element array buffer actually
        // affects our EBO, similar to the VBO operations above.
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        // Just like VBO, just send the data to the buffer.
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        // Unbind the buffers. Note that in normal OpenGL, we bind 0 to any place to
        // unbind. Since WebGL works on objects instead of integers as the handlers,
        // we use `null`.
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.vertexCount = indices.length;
        // Create a texture "object".
        this.texture = gl.createTexture();
        // Bind it to `gl.TEXTURE_2D` since we use this texture as a 2D one.
        // Similar to buffers, anything done to `gl.TEXTURE_2D` from now on
        // will actually affect our texture object "object".
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Our texture's settings.
        // Clamp for S, the horizontal axis/x axis.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Clamp for T, the vertical axis/y axis.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // Use nearest-neighbor sampling when we minify the texture (merge multiple
        // pixels of the texture to create a single frame/screen pixel; downsample).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // Use nearest-neighbor sampling when we magnify the texture (create multiple
        // frame/screen pixel out of a single texture source; upsample).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Unbind our texture "object".
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.ambientReflectance = ambientReflectance;
        this.diffuseReflectance = diffuseReflectance;
        this.specularReflectance = specularReflectance;
        this.shininess = shininess;
        this.checkerboard = checkerboard;
        this._translation = translation;
        this._rotation = rotation;
        this._scaling = scaling;
        // Since we directly set the properties, the transformation matrix is not created
        // when we finish the construction.
        this.setTransformMatrix();
    }
    get translation() {
        return this._translation;
    }
    get rotation() {
        return this._rotation;
    }
    get scaling() {
        return this._scaling;
    }
    set translation(value) {
        this._translation = value;
        this.setTransformMatrix();
    }
    set rotation(value) {
        this._rotation = value;
        this.setTransformMatrix();
    }
    set scaling(value) {
        this._scaling = value;
        this.setTransformMatrix();
    }
    render(meshShader) {
        // If the object is not active, just skip its rendering.
        if (!this.active) {
            return;
        }
        // Bind both VAO and texture.
        this.bind();
        meshShader.sendMat4('model', this.transformation);
        meshShader.sendVec3('ambientColor', this.ambientReflectance);
        meshShader.sendVec3('diffuseColor', this.diffuseReflectance);
        meshShader.sendVec3('specularColor', this.specularReflectance);
        meshShader.sendFloat('phongExponent', this.shininess);
        meshShader.sendBool('checkerboard', this.checkerboard);
        // `gl.UNSIGNED_INT` is actually `uint32`, which is how we format our
        // index buffers. First index is at the start (so, 0 offset) and
        // we draw `vertexCount` number of elements, each of whose index
        // value is an unsigned 32-bit integer.
        gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_INT, 0);
        // Unbind both VAO and texture.
        this.unbind();
    }
    setTexture(image) {
        // Bind our texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // and upload the image's data. Note that the browser takes care of some
        // format conversions, i.e. making the formats `gl.RGB` does not change
        // anything.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        // Unbind our texture.
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    bind() {
        gl.bindVertexArray(this.vao);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    unbind() {
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    setTransformMatrix() {
        // I just created shortcuts, writing `Math.` repeatedly is not
        // a thing a human should do.
        const sin = Math.sin;
        const cos = Math.cos;
        const translationMatrix = new Float32Array([
            1, 0, 0, this._translation[0],
            0, 1, 0, this._translation[1],
            0, 0, 1, this._translation[2],
            0, 0, 0, 1,
        ]);
        // For this, see https://en.wikipedia.org/wiki/Rotation_matrix#General_3D_rotations.
        // In summary, it is the combined rotation matrix, rotation around x, then y and then z
        // axis in this order.
        const alpha = this._rotation[0];
        const beta = this._rotation[1];
        const gamma = this._rotation[2];
        const rotationMatrix = new Float32Array([
            cos(beta) * cos(gamma),
            sin(alpha) * sin(beta) * cos(gamma) - cos(alpha) * sin(gamma),
            cos(alpha) * sin(beta) * cos(gamma) + sin(alpha) * sin(gamma),
            0,
            cos(beta) * sin(gamma),
            sin(alpha) * sin(beta) * sin(gamma) + cos(alpha) * cos(gamma),
            cos(alpha) * sin(beta) * sin(gamma) - sin(alpha) * cos(gamma),
            0,
            -sin(beta),
            sin(alpha) * cos(beta),
            cos(alpha) * cos(beta),
            0,
            0,
            0,
            0,
            1,
        ]);
        const scalingMatrix = new Float32Array([
            this._scaling[0], 0, 0, 0,
            0, this._scaling[1], 0, 0,
            0, 0, this._scaling[2], 0,
            0, 0, 0, 1,
        ]);
        // You may ask "Why the hell we take its transpose?"
        // Well, the problem probably is about how OpenGL stores the matrices.
        // In my implementation, I used row-major matrices, whereas OpenGL
        // uses column-major matrices, making them incompatible.
        this.transformation = math.transpose(math.matmul(translationMatrix, math.matmul(rotationMatrix, scalingMatrix)));
    }
}
//# sourceMappingURL=Mesh.js.map