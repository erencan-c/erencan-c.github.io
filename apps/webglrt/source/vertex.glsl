#version 300 es

in vec2 world_position;
out vec4 vertex_position;

void main() {
    vertex_position = vec4(world_position, 0.0f, 1.0f);
    gl_Position = vertex_position;
}