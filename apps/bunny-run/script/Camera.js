import * as math from './math.js';
export class Camera {
    position;
    direction;
    fov;
    aspectRatio;
    near;
    far;
    constructor(position, direction, fov, aspectRatio, near, far) {
        this.position = position;
        this.direction = direction;
        this.fov = fov;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;
    }
    getMatrix() {
        // The multiplication order should be the opposite. However, the incompatibility of
        // our matrices and OpenGL matrices is probably the reason of the error here.
        return math.matmul(math.view(this.position, this.direction), math.perspective(this.fov, this.aspectRatio, this.near, this.far));
    }
}
//# sourceMappingURL=Camera.js.map