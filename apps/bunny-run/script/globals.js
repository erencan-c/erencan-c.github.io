export const canvas = document.querySelector('#game');
export const loadImage = async (img) => {
    return new Promise((resolve, reject) => {
        img.onload = async () => {
            resolve(true);
        };
    });
};
export let settings = {
    width: window.innerWidth,
    height: window.innerHeight,
    running: true
};
export const gl = canvas.getContext('webgl2');
canvas.setAttribute('width', settings.width.toString());
canvas.setAttribute('height', settings.height.toString());
gl.viewport(0, 0, settings.width, settings.height);
export const keys = {};
export const fontInfo = await ((await fetch('asset/font.json')).json());
export const fontData = new Image();
fontData.src = 'asset/font.png';
await loadImage(fontData);
export const planeData = {
    vertex: new Float32Array([
        -1.0, -1.0, 0.0, +1.0, 0.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, 0.0, +1.0, 0.0, 0.0, 1.0, 0.0,
        +1.0, +1.0, 0.0, +1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, +1.0, 0.0, +1.0, 0.0, 0.0, 0.0, 1.0,
    ]),
    indices: new Uint32Array([
        0, 1, 2,
        0, 2, 3
    ])
};
export const cubeData = {
    vertex: new Float32Array([
        -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        +1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        +1.0, +1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, +1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, -1.0, +1.0, 0.0, 0.0, +1.0, 0.0, 0.0,
        +1.0, -1.0, +1.0, 0.0, 0.0, +1.0, 0.0, 0.0,
        +1.0, +1.0, +1.0, 0.0, 0.0, +1.0, 0.0, 0.0,
        -1.0, +1.0, +1.0, 0.0, 0.0, +1.0, 0.0, 0.0,
        -1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, +1.0, 0.0, -1.0, 0.0, 0.0, 0.0,
        -1.0, -1.0, +1.0, 0.0, -1.0, 0.0, 0.0, 0.0,
        -1.0, +1.0, -1.0, 0.0, +1.0, 0.0, 0.0, 0.0,
        +1.0, +1.0, -1.0, 0.0, +1.0, 0.0, 0.0, 0.0,
        +1.0, +1.0, +1.0, 0.0, +1.0, 0.0, 0.0, 0.0,
        -1.0, +1.0, +1.0, 0.0, +1.0, 0.0, 0.0, 0.0,
        -1.0, -1.0, -1.0, -1.0, 0.0, 0.0, 0.0, 0.0,
        -1.0, +1.0, -1.0, -1.0, 0.0, 0.0, 0.0, 0.0,
        -1.0, +1.0, +1.0, -1.0, 0.0, 0.0, 0.0, 0.0,
        -1.0, -1.0, +1.0, -1.0, 0.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, -1.0, +1.0, 0.0, 0.0, 0.0, 0.0,
        +1.0, +1.0, -1.0, +1.0, 0.0, 0.0, 0.0, 0.0,
        +1.0, +1.0, +1.0, +1.0, 0.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, +1.0, +1.0, 0.0, 0.0, 0.0, 0.0,
    ]),
    indices: new Uint32Array([
        2, 1, 0,
        0, 3, 2,
        4, 5, 6,
        6, 7, 4,
        8, 9, 10,
        10, 11, 8,
        14, 13, 12,
        12, 15, 14,
        18, 17, 16,
        16, 19, 18,
        20, 21, 22,
        22, 23, 20,
    ])
};
const bunnyFile = await ((await (fetch('asset/bunny.obj'))).text());
export const bunnyData = (() => {
    const bunnyVerticesJagged = [];
    const bunnyNormalsJagged = [];
    const bunnyIndicesJagged = [];
    // Split by lines
    for (let line of bunnyFile.split('\n')) {
        if (line.startsWith('v ')) { // Vertex
            bunnyVerticesJagged.push(line.substring(2).split(' ').map(parseFloat));
        }
        else if (line.startsWith('vn')) { // Normal
            bunnyNormalsJagged.push(line.substring(3).split(' ').map(parseFloat));
        }
        else if (line.startsWith('f')) { // Face
            const vertexIndexAndNormalIndex = line.substring(2).split(' ').flatMap(s => s.split('//').map(parseFloat).map(x => x - 1));
            // After the split for `indexAndFace`, we have
            // [vertexIdx_0, normalIdx_0, vertexIdx_1, normalIdx_1, vertexIdx_2, normalIdx_2]
            // where vertex indices and normal indices are the same. So, we take the first, third and fifth values,
            // which are the correct vertex indices.
            bunnyIndicesJagged.push([vertexIndexAndNormalIndex[0], vertexIndexAndNormalIndex[2], vertexIndexAndNormalIndex[4]]);
        }
    }
    const bunnyBufferJagged = [];
    for (let i = 0; i < bunnyVerticesJagged.length; i++) {
        // We push 0.0 as all texture coordinates since our bunny obj file does not have any texture
        // coordinates.
        bunnyBufferJagged.push([...bunnyVerticesJagged[i], ...bunnyNormalsJagged[i], 0.0, 0.0]);
    }
    // We need to flatten the jagged arrays, where every value is an array representing a single
    // vertex's values.
    const bunnyBuffer = bunnyBufferJagged.flat();
    const bunnyIndices = bunnyIndicesJagged.flat();
    return { vertex: new Float32Array(bunnyBuffer), indices: new Uint32Array(bunnyIndices) };
})();
export const backgroundStartTranslation = new Float32Array([0, 2, -49.5]);
export const backgroundStartScaling = new Float32Array([50, 50, 50]);
export const groundStartTranslation = new Float32Array([0, 0, -49.5]);
export const bunnyStartTranslation = new Float32Array([0, 0.5, -2.2]);
export const cameraStartTranslation = new Float32Array([0, 2, 0]);
export const bunnyStartRotation = new Float32Array([0, 0, 0]);
export const bunnyJumpFrequency = 0.8;
export const bunnyJumpHeight = 0.5;
//# sourceMappingURL=globals.js.map