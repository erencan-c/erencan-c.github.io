var a_penalty = document.getElementById('a-penalty');
var b_penalty = document.getElementById('b-penalty');
var result_penalty = document.getElementById('result-101');
var penalty_a = 0;
var penalty_b = 0;
function reset_penalty() {
    result_penalty.innerHTML = '';
    penalty_a = 0;
    penalty_b = 0;
}
function calculate_penalties() {
    var diff = penalty_a - penalty_b;
    var status_text = "A: ".concat(penalty_a, "\nB: ").concat(penalty_b, "\n");
    if (diff < 0) {
        alert(status_text + "B'nin cezas\u0131 ".concat(-diff, " daha fazla"));
    }
    else if (diff > 0) {
        alert(status_text + "A'n\u0131n cezas\u0131 ".concat(diff, " daha fazla"));
    }
    else {
        alert(status_text + "Cezalar E\u015Fit");
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
    penalty_a += a;
    penalty_b += b;
    a_penalty.value = '';
    b_penalty.value = '';
    display_penalty(a, b);
}
function calculate_offset(val) {
    var str = val.toString();
    var offset = 5 - str.length;
    return ' '.repeat(offset);
}
function display_penalty(a, b) {
    result_penalty.innerHTML += "".concat(calculate_offset(a)).concat(a, " ").concat(calculate_offset(b)).concat(b, "\n");
}
