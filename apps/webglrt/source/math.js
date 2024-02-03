"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.angleAxis = exports.applyTransformation = exports.scaleVector = exports.cross = exports.translate = exports.rotationMatrix = exports.matmul = void 0;
function matmul(m1, m2) {
    var ret = new Float32Array(16);
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            for (var k = 0; k < 4; k++) {
                ret[i * 4 + j] += m1[i * 4 + k] * m2[k * 4 + j];
            }
        }
    }
    return ret;
}
exports.matmul = matmul;
function rotationMatrix(x, y, z) {
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
exports.rotationMatrix = rotationMatrix;
function translate(vec, translation) {
    return new Float32Array([vec[0] + translation[0], vec[1] + translation[1], vec[2] + translation[2]]);
}
exports.translate = translate;
function cross(lhs, rhs) {
    return new Float32Array([
        lhs[1] * rhs[2] - lhs[2] * rhs[1],
        lhs[2] * rhs[0] - lhs[0] * rhs[2],
        lhs[0] * rhs[1] - lhs[1] * rhs[0]
    ]);
}
exports.cross = cross;
function scaleVector(vec, s) {
    return new Float32Array([
        vec[0] * s,
        vec[1] * s,
        vec[2] * s
    ]);
}
exports.scaleVector = scaleVector;
function applyTransformation(mat, vec) {
    var ret = new Float32Array(4);
    var v = new Float32Array(4);
    v[0] = vec[0];
    v[1] = vec[1];
    v[2] = vec[2];
    v[3] = 1.0;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 1; j++) {
            for (var k = 0; k < 4; k++) {
                ret[i * 1 + j] += mat[i * 4 + k] * v[k * 1 + j];
            }
        }
    }
    return new Float32Array([ret[0], ret[1], ret[2]]);
}
exports.applyTransformation = applyTransformation;
function angleAxis(axis, angle) {
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    var x = axis[0];
    var y = axis[1];
    var z = axis[2];
    return new Float32Array([
        cos + Math.pow(x, 2) * (1 - cos), x * y * (1 - cos) - z * sin, x * z * (1 - cos) + y * sin, 0.0,
        y * x * (1 - cos) + z * sin, cos + Math.pow(y, 2) * (1 - cos), y * z * (1 - cos) - x * sin, 0.0,
        z * x * (1 - cos) - y * sin, z * y * (1 - cos) + x * sin, cos + Math.pow(z, 2) * (1 - cos), 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
}
exports.angleAxis = angleAxis;
