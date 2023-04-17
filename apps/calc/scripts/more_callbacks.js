function clickLess() {
    normal_inputs.hidden = false;
    more_inputs.hidden = true;
}
function clickSin() {
    pushBuffer();
    applyUnary(function (v) { return Math.sin(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickCos() {
    pushBuffer();
    applyUnary(function (v) { return Math.cos(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickTan() {
    pushBuffer();
    applyUnary(function (v) { return Math.tan(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickCot() {
    pushBuffer();
    applyUnary(function (v) { return 1 / Math.tan(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickAsin() {
    pushBuffer();
    applyUnary(function (v) { return Math.asin(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickAcos() {
    pushBuffer();
    applyUnary(function (v) { return Math.acos(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickAtan() {
    pushBuffer();
    applyUnary(function (v) { return Math.atan(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickAtan2() {
    pushBuffer();
    applyBinary(function (lhs, rhs) { return Math.atan2(lhs, rhs); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickAcot() {
    pushBuffer();
    applyUnary(function (v) { return Math.atan(1 / v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickExp() {
    pushBuffer();
    applyUnary(function (v) { return Math.exp(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickLog() {
    pushBuffer();
    applyUnary(function (v) { return Math.log10(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickLn() {
    pushBuffer();
    applyUnary(function (v) { return Math.log(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickSqr() {
    pushBuffer();
    applyUnary(function (v) { return Math.pow(v, 2); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickSqrt() {
    pushBuffer();
    applyUnary(function (v) { return Math.sqrt(v); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickYroot() {
    pushBuffer();
    applyBinary(function (lhs, rhs) { return Math.pow(lhs, (1 / rhs)); }, function (v) { return typeof (v) === 'number'; });
    syncBuffer();
}
function clickPow() {
    pushBuffer();
    applyBinary(function (lhs, rhs) { return Math.pow(lhs, rhs); }, function (v) { return typeof (v) === 'number'; });
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
