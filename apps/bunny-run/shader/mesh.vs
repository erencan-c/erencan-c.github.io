#version 300 es
precision highp float;

uniform mat4 viewProjection;
uniform mat4 model;

layout(location = 0) in vec3 worldPosition;
layout(location = 1) in vec3 worldNormal;
layout(location = 2) in vec2 inUv;

out vec3 position;
out vec3 normal;
out vec2 uv;

void main() {
	// First, multiply from left with the model matrix. This will be sent to the fragment shader.
	vec4 modelPosition = model * vec4(worldPosition, 1.0);

	// Multiply further with view and projection matrices.
	vec4 out_position = viewProjection * modelPosition;

	// Normal is a vector, so we need to multiply with the transpose of the inverse
	// of the transformation matrix we have prepared for our vertices.
	// This can actually be pre-calculated in CPU, which will be faster. However,
	// I do not want to write a matrix inverse function.
	vec4 out_normal = transpose(inverse(model)) * vec4(worldNormal, 0.0);

	gl_Position = vec4(worldPosition, 1.0);
	gl_Position = out_position;
	position = vec3(modelPosition);

	// The normal may be longer than 1, so let's fix it.
	normal = normalize(vec3(out_normal));

	uv = inUv;
}
