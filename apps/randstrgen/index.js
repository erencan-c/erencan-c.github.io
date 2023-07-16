'use strict';
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var textbox = document.querySelector('#textbox');
var length_input = document.querySelector('#length');
var include_numbers = document.querySelector('#include-numbers');
var include_captials = document.querySelector('#include-capitals');
var include_underline = document.querySelector('#include-underline');
var include_dash = document.querySelector('#include-dash');
var include_pound = document.querySelector('#include-pound');
var include_dollar = document.querySelector('#include-dollar');
var include_dot = document.querySelector('#include-dot');
function convert_ascii_range(start, end) {
    var ret = [];
    for (var i = start; i <= end; i++) {
        ret.push(String.fromCharCode(i));
    }
    return ret;
}
function random_select_element(arr) {
    var len = arr.length;
    var rand = len;
    while (rand === len)
        rand = Math.floor(Math.random() * len);
    return arr[rand];
}
var LETTERS = convert_ascii_range('a'.charCodeAt(0), 'z'.charCodeAt(0));
var CAPITALS = convert_ascii_range('A'.charCodeAt(0), 'Z'.charCodeAt(0));
var NUMBERS = convert_ascii_range('0'.charCodeAt(0), '9'.charCodeAt(0));
function generate_string() {
    var len = parseInt(length_input.value);
    var character_list = __spreadArray([], LETTERS, true);
    if (include_captials.checked)
        character_list = character_list.concat(CAPITALS);
    if (include_numbers.checked)
        character_list = character_list.concat(NUMBERS);
    if (include_underline.checked)
        character_list.push('_');
    if (include_dash.checked)
        character_list.push('-');
    if (include_pound.checked)
        character_list.push('#');
    if (include_dollar.checked)
        character_list.push('$');
    if (include_dot.checked)
        character_list.push('.');
    var str = Array.apply(null, new Array(len)).map(function (_) { return random_select_element(character_list); });
    var result = str.join('');
    textbox.innerHTML = result;
    navigator.clipboard.writeText(result);
}
