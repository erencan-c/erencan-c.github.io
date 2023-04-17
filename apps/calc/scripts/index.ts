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
let normal_inputs = document.getElementById('inputs') as HTMLDivElement;
let more_inputs = document.getElementById('more-inputs') as HTMLDivElement;

function syncBuffer() {
    const fontSize = parseFloat(window.getComputedStyle(outText, null).getPropertyValue('font-size')) + 1;
    
    bufText.value = buf;
    outText.value = '';
    for(let i = c.stack.length-1; i >= 0; i--) {
        outText.value += `${String(c.stack[i])}\n`;
    }
}

function pushBuffer() {
    if(buf !== '') {
        c.evaluate(buf);
        buf = '';
    }
}

type CalculatorPredicate = (v: CalculatorValue) => boolean;
type CalculatorUnaryOperation = (v: CalculatorValue) => CalculatorValue;
type CalculatorBinaryOperation = (lhs: CalculatorValue, rhs: CalculatorValue) => CalculatorValue;

function applyUnary(operation: CalculatorUnaryOperation, predicate?: CalculatorPredicate) {
    let val = c.stack.pop();
    if(val) {
        if(!predicate || predicate(val)) {
            c.stack.push(operation(val));
        } else {
            c.stack.push(val);
        }
    }
}

function applyBinary(operation: CalculatorBinaryOperation, predicateLhs?: CalculatorPredicate, predicateRhs?: CalculatorPredicate) {
    let rhs = c.stack.pop();
    if(!rhs) {
        return;
    }
    let lhs = c.stack.pop();
    if(!lhs) {
        c.stack.push(rhs);
        return;
    }
    if(!predicateLhs) {
        c.stack.push(operation(lhs,rhs));
        return;
    }
    if(!predicateRhs) {
        predicateRhs = predicateLhs;
    }
    if(predicateLhs(lhs) && predicateRhs(rhs)) {
        c.stack.push(operation(lhs,rhs));
    }
}

let c = new Calculator();
