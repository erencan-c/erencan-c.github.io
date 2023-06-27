export { matmul, rotationMatrix, translate, cross, scaleVector, applyTransformation, angleAxis };

function matmul(m1: Float32Array, m2: Float32Array): Float32Array {
    let ret = new Float32Array(16);
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            for(let k = 0; k < 4; k++) {
                ret[i*4 + j] += m1[i*4 + k]*m2[k*4 + j];
            }
        }
    }
    return ret;
}

function rotationMatrix(x: number, y: number, z: number): Float32Array {
    return matmul(matmul(new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, Math.cos(x), -Math.sin(x), 0.0,
        0.0, Math.sin(x), Math.cos(x), 0.0,
        0.0, 0.0, 0.0, 1.0
    ]), new Float32Array([
        Math.cos(y), 0.0, Math.sin(y), 0.0,
        0.0, 1.0, 0.0, 0.0,
        -Math.sin(y), 0.0, Math.cos(y), 0.0,
        0.0, 0.0, 0.0, 1.0
    ])), new Float32Array([
        Math.cos(z), -Math.sin(z), 0.0, 0.0,
        Math.sin(z), Math.cos(z), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]));
}

function translate(vec: Float32Array, translation: Float32Array): Float32Array {
    return new Float32Array([vec[0] + translation[0], vec[1] + translation[1], vec[2] + translation[2]]);
}

function cross(lhs: Float32Array, rhs: Float32Array): Float32Array {
    return new Float32Array([
        lhs[1]*rhs[2] - lhs[2]*rhs[1],
        lhs[2]*rhs[0] - lhs[0]*rhs[2],
        lhs[0]*rhs[1] - lhs[1]*rhs[0]
    ]);
}

function scaleVector(vec: Float32Array, s: number): Float32Array {
    return new Float32Array([
        vec[0]*s,
        vec[1]*s,
        vec[2]*s
    ]);
}

function applyTransformation(mat: Float32Array, vec: Float32Array): Float32Array {
    let ret = new Float32Array(4);
    let v = new Float32Array(4);
    v[0] = vec[0];
    v[1] = vec[1];
    v[2] = vec[2];
    v[3] = 1.0;
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 1; j++) {
            for(let k = 0; k < 4; k++) {
                ret[i*1 + j] += mat[i*4 + k]*v[k*1 + j];
            }
        }
    }
    return new Float32Array([ret[0], ret[1], ret[2]]);
}

function angleAxis(axis: Float32Array, angle: number): Float32Array {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    return new Float32Array([
        cos + x**2 * (1-cos), x*y*(1-cos) - z*sin, x*z*(1-cos) + y*sin, 0.0,
        y*x*(1-cos) + z*sin, cos + y**2 * (1-cos), y*z*(1-cos) - x*sin, 0.0,
        z*x*(1-cos) - y*sin, z*y*(1-cos) + x*sin, cos + z**2 * (1-cos), 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
}
