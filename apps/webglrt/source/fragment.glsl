#version 300 es
precision highp float;

uniform float t;
in vec4 vertex_position;
out vec4 color;

void main() {
    color = vec4((vertex_position.xy)/2.0f + vec2(0.5f, 0.5f), mod(t, 5.0f)/5.0f, 1.0f);
}
