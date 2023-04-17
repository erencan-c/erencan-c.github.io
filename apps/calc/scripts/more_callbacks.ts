function clickLess() {
    normal_inputs.hidden = false;
    more_inputs.hidden = true;
}

function clickSin() {
    pushBuffer();
    applyUnary((v) => Math.sin(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickCos() {
    pushBuffer();
    applyUnary((v) => Math.cos(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickTan() {
    pushBuffer();
    applyUnary((v) => Math.tan(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickCot() {
    pushBuffer();
    applyUnary((v) => 1/Math.tan(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickAsin() {
    pushBuffer();
    applyUnary((v) => Math.asin(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickAcos() {
    pushBuffer();
    applyUnary((v) => Math.acos(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickAtan() {
    pushBuffer();
    applyUnary((v) => Math.atan(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickAtan2() {
    pushBuffer();
    applyBinary((lhs,rhs) => Math.atan2(lhs as number, rhs as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickAcot() {
    pushBuffer();
    applyUnary((v) => Math.atan(1/(v as number)), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickExp() {
    pushBuffer();
    applyUnary((v) => Math.exp(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickLog() {
    pushBuffer();
    applyUnary((v) => Math.log10(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickLn() {
    pushBuffer();
    applyUnary((v) => Math.log(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickSqr() {
    pushBuffer();
    applyUnary((v) => (v as number) ** 2, (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickSqrt() {
    pushBuffer();
    applyUnary((v) => Math.sqrt(v as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickYroot() {
    pushBuffer();
    applyBinary((lhs,rhs) => (lhs as number) ** (1/(rhs as number)), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickPow() {
    pushBuffer();
    applyBinary((lhs,rhs) => (lhs as number) ** (rhs as number), (v) => typeof(v) === 'number');
    syncBuffer();
}

function clickPi() {
    pushBuffer();
    c.stack.push(Math.PI);
    syncBuffer();
}

function clickE() {
    pushBuffer();
    c.stack.push(Math.E);
    syncBuffer();
}
