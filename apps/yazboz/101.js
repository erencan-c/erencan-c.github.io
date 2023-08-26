var a_penalty = document.getElementById('a-penalty');
var b_penalty = document.getElementById('b-penalty');
var result_penalty = document.getElementById('result-101');
var diff = 0;
function reset_penalty() {
    result_penalty.innerHTML = '';
    diff = 0;
}
function calculate_penalties() {
    if (diff < 0) {
        alert("B'nin cezas\u0131 ".concat(-diff, " daha fazla"));
    }
    else if (diff > 0) {
        alert("A'n\u0131n cezas\u0131 ".concat(diff, " daha fazla"));
    }
    else {
        alert("Cezalar E\u015Fit");
    }
}
function enter_penalty() {
    var a = 0;
    var b = 0;
    if (a_penalty.value == '') {
        a = -100;
    }
    else {
        a = Number(a_penalty.value);
    }
    if (b_penalty.value == '') {
        b = -100;
    }
    else {
        b = Number(b_penalty.value);
    }
    diff += a - b;
}
