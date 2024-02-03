import { gl, planeData, fontData, fontInfo, settings } from './globals.js';
import { Shader } from './Shader.js';
import * as math from './math.js';

const fontMaxHeight = Math.max(...Object.keys(fontInfo.characters).map(c => fontInfo.characters[c].height));

const vertexSource = await (await fetch('../shader/text.vs')).text();
const fragmentSource = await (await fetch('../shader/text.fs')).text();
const alphabetAtlas = (() => {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fontData);

	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
})();
const shader = new Shader(vertexSource, fragmentSource);
const [vao, vbo, ebo, vertexCount] = (() => {
	// See `constructor` of `Mesh` class for detailed explanation.

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, planeData.vertex, gl.STATIC_DRAW);
	// We only have a single attribute. Using the texture coordinates of the existing quad mesh
	// which are in the range [0,1] is pretty reasonable. Note that our stride and offset are the
	// same as the `Mesh`'s texture coordinate attribute since the actual buffer is same.
	// We actually waste memory in the GPU. However, a quad has a very small amount of data, so
	// the wasted space if not important.
	gl.vertexAttribPointer(
		0,
		2,
		gl.FLOAT,
		false,
		8 * Float32Array.BYTES_PER_ELEMENT,
		6 * Float32Array.BYTES_PER_ELEMENT
	);
	gl.enableVertexAttribArray(0);

	const ebo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, planeData.indices, gl.STATIC_DRAW);

	gl.bindVertexArray(null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const vertexCount = planeData.indices.length;

	return [vao, vbo, ebo, vertexCount];
})();

export function renderText(text: string, color: Float32Array, letterHeightPixels: number = 50) {
	shader.bind();
	gl.bindVertexArray(vao);
	gl.bindTexture(gl.TEXTURE_2D, alphabetAtlas);

	// For OpenGL, every window has height 2 (from -1 to 1). This division gives us the
	// ratio of the letter height and the window height, which means that 0 is a letter
	// with 0 height nad 1 means a letter with window height. If we multiply this result
	// with 2, we get the correct result.
	const letterHeightNormalized = 2 * letterHeightPixels / settings.height;

	const quadOffset = new Float32Array([0, 0]);
	for (const char of text) {
		const letterAspectRatio = fontInfo.characters[char].width / fontInfo.characters[char].height;

		// In the fontInfo, space has a very small height compared to other characters. We can
		// use an arbitrary but nice number for it. 40% of the height of the tallest letter
		// should be pretty nice in most cases.
		const letterMaxRatio = char !== ' ' ? (fontInfo.characters[char].height / fontMaxHeight) : (0.4);

		// The quad should be something like the "bounding box" of the letter. The height already depends
		// on the window height, but the width is currently not. This creates issues when we increase
		// the width without increasing the height, effectively changing the aspect ratio of the window.
		// If we increase the aspect ratio, the width of the letters (which are in the OpenGL's [-1,1] space)
		// so that the visible width does not change if we increase the width.
		const quadSize = new Float32Array([
			letterAspectRatio * letterHeightNormalized * letterMaxRatio / (settings.width / settings.height),
			letterHeightNormalized * letterMaxRatio,
		]);

		// The top left texture coordinate of the letter.
		const letterTextureOffset = new Float32Array([
			fontInfo.characters[char].x / fontInfo.width,
			fontInfo.characters[char].y / fontInfo.height,
		]);

		// The difference between the bottom right and top left texture coordinates.
		const letterTextureSize = new Float32Array([
			fontInfo.characters[char].width / fontInfo.width,
			fontInfo.characters[char].height / fontInfo.height
		]);

		// We render towards top, so rendering at y=1.0 actually renders out of the screen.
		// We can just shift every letter by the height of the letters.
		shader.sendVec2('quadOffset', math.add(quadOffset, new Float32Array([0, -letterHeightNormalized])));
		shader.sendVec2('quadSize', quadSize);
		shader.sendVec2('letterTextureSize', letterTextureSize);
		shader.sendVec2('letterTextureOffset', letterTextureOffset);
		shader.sendVec3('textColor', color);

		// Next letter's offset.
		quadOffset[0] += quadSize[0];
		gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_INT, 0);
	}

	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	shader.unbind();
}