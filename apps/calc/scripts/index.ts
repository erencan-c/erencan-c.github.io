'use strict';

class Matrix {
    row: number;
    col: number;
    data: Float64Array;

    constructor(r: number, c: number, dat?: (Float64Array | number[])) {
        this.row = r;
        this.col = c;
        if(dat instanceof Float64Array) {
            this.data = dat;
        } else if(dat instanceof Array) {
            this.data = new Float64Array(dat);
        } else {
            this.data = new Float64Array(r*c);
        }
    }

    static identity(size: number) {
        let ret = new Float64Array(size*size);
        for(let i = 0; i < size; i++) {
            ret[i*size + i] = 1;
        }
        return new Matrix(size, size, ret);
    }

    private checkDimensions(other: Matrix) {
        if(this.row !== other.row || this.col !== other.col) {
            throw new Error(`Operand sizes do no match: (${this.row}, ${this.col}) and (${other.row}, ${other.col})`);
        }
    }

    add(other: Matrix) {
        this.checkDimensions(other);
        let len = this.row*this.col;
        let retData = new Float64Array(len);
        for(let i = 0; i < len; i++) {
            retData[i] = this.data[i] + other.data[i];
        }
        return new Matrix(this.row, this.col, retData);
    }

    sub(other: Matrix) {
        this.checkDimensions(other);
        let len = this.row*this.col;
        let retData = new Float64Array(len);
        for(let i = 0; i < len; i++) {
            retData[i] = this.data[i] - other.data[i];
        }
        return new Matrix(this.row, this.col, retData);
    }

    mul(other: Matrix | number) {
        let len = this.row*this.col;
        let retData = new Float64Array(len);
        if(other instanceof Matrix) {
            this.checkDimensions(other);
            for(let i = 0; i < len; i++) {
                retData[i] = this.data[i] * other.data[i];
            }
        } else {
            for(let i = 0; i < len; i++) {
                retData[i] = this.data[i] * other
            }
        }
        return new Matrix(this.row, this.col, retData);
    }

    div(other: Matrix | number) {
        let len = this.row*this.col;
        let retData = new Float64Array(len);
        if(other instanceof Matrix) {
            this.checkDimensions(other);
            for(let i = 0; i < len; i++) {
                retData[i] = this.data[i] / other.data[i];
            }
        } else {
            for(let i = 0; i < len; i++) {
                retData[i] = this.data[i] / other
            }
        }
        return new Matrix(this.row, this.col, retData);
    }

    matmul(other: Matrix) {
        if(this.col !== other.row) {
            throw new Error(`Operand sizes do not match for matrix multiplication: (${this.row}, ${this.col}) and (${other.row}, ${other.col})`);
        }
        let retData = new Float64Array(this.row*other.col);
        for(let i = 0; i < this.row; i++) {
            for(let j = 0; j < other.col; j++) {
                for(let k = 0; k < this.col; k++) {
                    retData[i*this.row + j] += this.data[i*this.row + k] * other.data[k*this.row + j];
                }
            }
        }
        return new Matrix(this.row, other.col, retData);
    }
}

type CalculatorValue = number | Matrix;

class Calculator {
    stack: CalculatorValue[];
    static operators: { [Key: string]: (self: Calculator) => void } = {
        "+": (self: Calculator) => {
            let second = self.stack.pop();
            let first = self.stack.pop();

            if(first instanceof Matrix && second instanceof Matrix) {
                self.stack.push(first.add(second));
            } else if(typeof(first) === 'number' && typeof(second) === 'number') {
                self.stack.push(first + second);
            } else {
                if(first) {
                    self.stack.push(first);
                }
                if(second) {
                    self.stack.push(second);
                }
                throw new Error(`Unsupported operand types: ${typeof(first)} ${typeof(second)} +`);
            }
        },

        "-": (self: Calculator) => {
            let second = self.stack.pop();
            let first = self.stack.pop();

            if(first instanceof Matrix && second instanceof Matrix) {
                self.stack.push(first.sub(second));
            } else if(typeof(first) === 'number' && typeof(second) === 'number') {
                self.stack.push(first - second);
            } else {
                if(first) {
                    self.stack.push(first);
                }
                if(second) {
                    self.stack.push(second);
                }
                throw new Error(`Unsupported operand types: ${typeof(first)} ${typeof(second)} -`);
            }
        },
        
        "*": (self: Calculator) => {
            let second = self.stack.pop();
            let first = self.stack.pop();

            if(first instanceof Matrix && second instanceof Matrix) {
                self.stack.push(first.matmul(second));
            } else if(typeof(first) === 'number' && typeof(second) === 'number') {
                self.stack.push(first * second);
            } else if(first instanceof Matrix && typeof(second) === 'number') {
                self.stack.push(first.mul(second));
            } else if(typeof(first) === 'number' && second instanceof Matrix) {
                self.stack.push(second.mul(first));
            } else {
                if(first) {
                    self.stack.push(first);
                }
                if(second) {
                    self.stack.push(second);
                }
                throw new Error(`Unsupported operand types: ${typeof(first)} ${typeof(second)} *`);
            }
        },

        "/": (self: Calculator) => {
            let second = self.stack.pop();
            let first = self.stack.pop();

            if(typeof(first) === 'number' && typeof(second) === 'number') {
                self.stack.push(first / second);
            } else if(first instanceof Matrix && typeof(second) === 'number') {
                self.stack.push(first.div(second));
            } else if(typeof(first) === 'number' && second instanceof Matrix) {
                self.stack.push(second.div(first));
            } else {
                if(first) {
                    self.stack.push(first);
                }
                if(second) {
                    self.stack.push(second);
                }
                throw new Error(`Unsupported operand types: ${typeof(first)} ${typeof(second)} /`);
            }
        },
    };

    constructor() {
        this.stack = []
    }

    evaluate(str: string) {
        if(str in Calculator.operators) {
            Calculator.operators[str](this);
        } else if(!isNaN(Number(str))) {
            this.stack.push(Number(str));
        } else {
            throw new Error(`Cannot interpret the term: ${str}`);
        }
    }
}

let buf = ""
let bufText = document.getElementById("buf") as HTMLInputElement;
let outText = document.getElementById("out") as HTMLInputElement;

function syncBuffer() {
    const fontSize = parseFloat(window.getComputedStyle(outText, null).getPropertyValue('font-size')) + 1;
    
    bufText.value = buf;
    outText.value = '';
    for(let i = c.stack.length-1; i >= 0; i--) {
        outText.value += `${String(c.stack[i])}\n\n`;
    }
}

function clickClear() {
    buf = ''
    syncBuffer();
}

function clickPop() {
    let popped = c.stack.pop();
    if(popped) {
        buf = popped.toString();
    } else {
        buf = '';
    }
    syncBuffer();
}

function clickSwap() {
    let second = c.stack.pop();
    if(!second) {
        return;
    }
    let first = c.stack.pop();
    if(!first) {
        c.stack.push(second);
        return;
    }
    c.stack.push(second);
    c.stack.push(first);
    syncBuffer();
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
    if(buf !== '') {
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
    if(buf !== '') {
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
    if(buf !== '') {
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
    if(buf !== '') {
        c.evaluate(buf);
        buf = ''
    }
    syncBuffer();
}

function clickDiv() {
    if(buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
    c.evaluate('/');
    syncBuffer();
}

let c = new Calculator();
