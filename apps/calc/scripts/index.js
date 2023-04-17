'use strict';
var Matrix = /** @class */ (function () {
    function Matrix(r, c, dat) {
        this.row = r;
        this.col = c;
        if (dat instanceof Float64Array) {
            this.data = dat;
        }
        else if (dat instanceof Array) {
            this.data = new Float64Array(dat);
        }
        else {
            this.data = new Float64Array(r * c);
        }
    }
    Matrix.identity = function (size) {
        var ret = new Float64Array(size * size);
        for (var i = 0; i < size; i++) {
            ret[i * size + i] = 1;
        }
        return new Matrix(size, size, ret);
    };
    Matrix.prototype.checkDimensions = function (other) {
        if (this.row !== other.row || this.col !== other.col) {
            throw new Error("Operand sizes do no match: (".concat(this.row, ", ").concat(this.col, ") and (").concat(other.row, ", ").concat(other.col, ")"));
        }
    };
    Matrix.prototype.add = function (other) {
        this.checkDimensions(other);
        var len = this.row * this.col;
        var retData = new Float64Array(len);
        for (var i = 0; i < len; i++) {
            retData[i] = this.data[i] + other.data[i];
        }
        return new Matrix(this.row, this.col, retData);
    };
    Matrix.prototype.sub = function (other) {
        this.checkDimensions(other);
        var len = this.row * this.col;
        var retData = new Float64Array(len);
        for (var i = 0; i < len; i++) {
            retData[i] = this.data[i] - other.data[i];
        }
        return new Matrix(this.row, this.col, retData);
    };
    Matrix.prototype.mul = function (other) {
        var len = this.row * this.col;
        var retData = new Float64Array(len);
        if (other instanceof Matrix) {
            this.checkDimensions(other);
            for (var i = 0; i < len; i++) {
                retData[i] = this.data[i] * other.data[i];
            }
        }
        else {
            for (var i = 0; i < len; i++) {
                retData[i] = this.data[i] * other;
            }
        }
        return new Matrix(this.row, this.col, retData);
    };
    Matrix.prototype.div = function (other) {
        var len = this.row * this.col;
        var retData = new Float64Array(len);
        if (other instanceof Matrix) {
            this.checkDimensions(other);
            for (var i = 0; i < len; i++) {
                retData[i] = this.data[i] / other.data[i];
            }
        }
        else {
            for (var i = 0; i < len; i++) {
                retData[i] = this.data[i] / other;
            }
        }
        return new Matrix(this.row, this.col, retData);
    };
    Matrix.prototype.matmul = function (other) {
        if (this.col !== other.row) {
            throw new Error("Operand sizes do not match for matrix multiplication: (".concat(this.row, ", ").concat(this.col, ") and (").concat(other.row, ", ").concat(other.col, ")"));
        }
        var retData = new Float64Array(this.row * other.col);
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < other.col; j++) {
                for (var k = 0; k < this.col; k++) {
                    retData[i * this.row + j] += this.data[i * this.row + k] * other.data[k * this.row + j];
                }
            }
        }
        return new Matrix(this.row, other.col, retData);
    };
    return Matrix;
}());
var Calculator = /** @class */ (function () {
    function Calculator() {
        this.stack = [];
    }
    Calculator.prototype.evaluate = function (str) {
        if (str in Calculator.operators) {
            Calculator.operators[str](this);
        }
        else if (!isNaN(Number(str))) {
            this.stack.push(Number(str));
        }
        else {
            throw new Error("Cannot interpret the term: ".concat(str));
        }
    };
    Calculator.operators = {
        "+": function (self) {
            var second = self.stack.pop();
            var first = self.stack.pop();
            if (first instanceof Matrix && second instanceof Matrix) {
                self.stack.push(first.add(second));
            }
            else if (typeof (first) === 'number' && typeof (second) === 'number') {
                self.stack.push(first + second);
            }
            else {
                throw new Error("Unsupported operand types: ".concat(typeof (first), " ").concat(typeof (second), " +"));
            }
        },
        "-": function (self) {
            var second = self.stack.pop();
            var first = self.stack.pop();
            if (first instanceof Matrix && second instanceof Matrix) {
                self.stack.push(first.sub(second));
            }
            else if (typeof (first) === 'number' && typeof (second) === 'number') {
                self.stack.push(first - second);
            }
            else {
                throw new Error("Unsupported operand types: ".concat(typeof (first), " ").concat(typeof (second), " -"));
            }
        },
        "*": function (self) {
            var second = self.stack.pop();
            var first = self.stack.pop();
            if (first instanceof Matrix && second instanceof Matrix) {
                self.stack.push(first.matmul(second));
            }
            else if (typeof (first) === 'number' && typeof (second) === 'number') {
                self.stack.push(first * second);
            }
            else if (first instanceof Matrix && typeof (second) === 'number') {
                self.stack.push(first.mul(second));
            }
            else if (typeof (first) === 'number' && second instanceof Matrix) {
                self.stack.push(second.mul(first));
            }
            else {
                throw new Error("Unsupported operand types: ".concat(typeof (first), " ").concat(typeof (second), " *"));
            }
        },
        "/": function (self) {
            var second = self.stack.pop();
            var first = self.stack.pop();
            if (typeof (first) === 'number' && typeof (second) === 'number') {
                self.stack.push(first / second);
            }
            else if (first instanceof Matrix && typeof (second) === 'number') {
                self.stack.push(first.div(second));
            }
            else if (typeof (first) === 'number' && second instanceof Matrix) {
                self.stack.push(second.div(first));
            }
            else {
                throw new Error("Unsupported operand types: ".concat(typeof (first), " ").concat(typeof (second), " /"));
            }
        },
    };
    return Calculator;
}());
var buf = "";
var bufText = document.getElementById("buf");
var outText = document.getElementById("out");
function syncBuffer() {
    var fontSize = parseFloat(window.getComputedStyle(outText, null).getPropertyValue('font-size')) + 1;
    bufText.value = buf;
    outText.value = '';
    for (var i = c.stack.length - 1; i >= 0; i--) {
        outText.value += "".concat(String(c.stack[i]), "\n");
    }
    outText.style.height = (c.stack.length + 1) * fontSize + 'px';
}
function click7() {
    buf += '7';
    syncBuffer();
}
function click8() {
    buf += '8';
    syncBuffer();
}
function click9() {
    buf += '9';
    syncBuffer();
}
function clickPlus() {
    if (buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
    c.evaluate('+');
    syncBuffer();
}
function click4() {
    buf += '4';
    syncBuffer();
}
function click5() {
    buf += '5';
    syncBuffer();
}
function click6() {
    buf += '6';
    syncBuffer();
}
function clickMinus() {
    if (buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
    c.evaluate('-');
    syncBuffer();
}
function click1() {
    buf += '1';
    syncBuffer();
}
function click2() {
    buf += '2';
    syncBuffer();
}
function click3() {
    buf += '3';
    syncBuffer();
}
function clickStar() {
    if (buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
    c.evaluate('*');
    syncBuffer();
}
function clickDot() {
    buf += '.';
    syncBuffer();
}
function click0() {
    buf += '0';
    syncBuffer();
}
function clickEqual() {
    if (buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
    syncBuffer();
}
function clickDiv() {
    if (buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
    c.evaluate('/');
    syncBuffer();
}
var c = new Calculator();
