#version 300 es
precision highp float;

uniform vec2 quadOffset;
uniform vec2 quadSize;
uniform vec2 letterTextureSize;
uniform vec2 letterTextureOffset;

layout(location = 0) in vec2 planePosition;

out vec2 texturePosition;

void main() {
	// From (-1,1) i.e. the top left corner, go about the quadOffset. The `planePosition` is a vector with x and y components
	// either 0 or 1, so multiplying it with `quadSize` creates a plane of size `quadSize`, which is what we want.
	// I chose Z as -1.0, which can be any number near -1.0 from the positive side in order to draw the text
	// on top of any other mesh.
	gl_Position = vec4(vec2(-1.0, 1.0) + quadOffset + planePosition * quadSize, -1.0, 1.0);

	// OpenGL expects textures from bottom left. However, gl.texImage2D uploads textures starting from top left,
	// which results in upside-down images. 1.0-y is to fix it.
	texturePosition = vec2(planePosition.x, 1.0 - planePosition.y) * letterTextureSize + letterTextureOffset;
}
