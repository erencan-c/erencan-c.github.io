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

function clickMore() {
    normal_inputs.hidden = true;
    more_inputs.hidden = false;
}

function clickErase() {
    buf = buf.slice(0, buf.length-1);
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
    pushBuffer();
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
    pushBuffer();
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
    pushBuffer();
    c.evaluate('*');
    syncBuffer();
}

function clickClearStack() {
    c.stack = [];
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
    pushBuffer();
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