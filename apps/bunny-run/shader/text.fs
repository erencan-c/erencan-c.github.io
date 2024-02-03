#version 300 es
precision highp float;

uniform sampler2D alphabet;
uniform vec3 textColor;

in vec2 texturePosition;

out vec4 color;

void main() {
	vec4 outColor = texture(alphabet, texturePosition);
	if(outColor.r == 1.0) { // Letter
		color = outColor * vec4(textColor, 1.0);
	} else { // Void
		discard;
	}
}
