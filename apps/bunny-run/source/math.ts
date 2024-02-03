export type Vec3 = Float32Array;

// Functions in this module have been either created by me using normal mathematical
// definitions, or taken from glm library.

export function add(lhs: Float32Array, rhs: Float32Array): Float32Array {
	const ret = new Float32Array(lhs);
	for (let i = 0; i < ret.length; i++) {
		ret[i] += rhs[i];
	}
	return ret;
}

export function dot(lhs: Vec3, rhs: Vec3): number {
	return lhs[0] * rhs[0] + lhs[1] * rhs[1] + lhs[2] * rhs[2];
}

export function length(vec: Vec3): number {
	return Math.sqrt(dot(vec, vec));
}

export function distance(vec1: Vec3, vec2: Vec3): number {
	return length(add(vec1, mul(vec2, -1)));
}

export function mul(vec: Vec3, num: number): Vec3 {
	return new Float32Array([vec[0] * num, vec[1] * num, vec[2] * num]);
}

export function normalize(vec: Vec3): Vec3 {
	return mul(vec, 1.0 / length(vec));
}

export function cross(lhs: Vec3, rhs: Vec3): Vec3 {
	return new Float32Array([
		lhs[1] * rhs[2] - lhs[2] * rhs[1],
		lhs[2] * rhs[0] - lhs[0] * rhs[2],
		lhs[0] * rhs[1] - lhs[1] * rhs[0]
	]);
}

export function matmul(lhs: Float32Array, rhs: Float32Array): Float32Array {
	const ret = new Float32Array(16);
	for (let i = 0; i < 16; i++) {
		ret[i] = 0;
	}
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			for (let k = 0; k < 4; k++) {
				ret[i * 4 + j] += lhs[i * 4 + k] * rhs[k * 4 + j];
			}
		}
	}
	return ret;
}

export function transpose(mat: Float32Array): Float32Array {
	const ret = new Float32Array(16);
	for(let i = 0; i < 4; i++) {
		for(let j = 0; j < 4; j++) {
			ret[i * 4 + j] = mat[j * 4 + i];
		}
	}
	return ret;
}

export function perspective(fov: number, aspectRatio: number, near: number, far: number): Float32Array {
	const n = near;
	const f = far;
	const tanHalfFov = Math.tan((Math.PI / 180) * fov / 2);
	return new Float32Array([
		(1.0 / (aspectRatio * tanHalfFov)), 0, 0, 0,
		0, (1.0 / tanHalfFov), 0, 0,
		0, 0, -((f + n) / (f - n)), -1,
		0, 0, -((2 * f * n) / (f - n)), 0
	]);
}

export function view(position: Vec3, dir: Vec3, up: Vec3 = new Float32Array([0, 1, 0])) {
	const direction = normalize(dir);
	const right = normalize(cross(direction, up));
	const new_up = normalize(cross(right, direction));
	const u = right;
	const v = new_up;
	const w = direction;
	const e = position;
	return new Float32Array([
		u[0], v[0], -w[0], 0,
		u[1], v[1], -w[1], 0,
		u[2], v[2], -w[2], 0,
		-dot(u, e), -dot(v, e), dot(w, e), 1
	]);
}

export function clamp(value: number, start: number = 0, end: number = 1) {
	if(start < value && value < end) {
		return value;
	} else if(value <= start) {
		return start;
	} else {
		return end;
	}
}