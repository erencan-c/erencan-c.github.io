'use strict';

const textbox = document.querySelector('#textbox') as HTMLInputElement;
const length_input = document.querySelector('#length') as HTMLInputElement;
const include_numbers = document.querySelector('#include-numbers') as HTMLInputElement;
const include_captials = document.querySelector('#include-capitals') as HTMLInputElement;
const include_underline = document.querySelector('#include-underline') as HTMLInputElement;
const include_dash = document.querySelector('#include-dash') as HTMLInputElement;
const include_pound = document.querySelector('#include-pound') as HTMLInputElement;
const include_dollar = document.querySelector('#include-dollar') as HTMLInputElement;
const include_dot = document.querySelector('#include-dot') as HTMLInputElement;

function convert_ascii_range(start: number, end: number): string[] {
	let ret: string[] = [];
	for (let i = start; i <= end; i++) {
		ret.push(String.fromCharCode(i));
	}
	return ret;
}

function random_select_element<T>(arr: T[]): T {
	let len = arr.length;
	let rand = len;
	while(rand === len)
		rand = Math.floor(Math.random()*len);
	return arr[rand];
}

const LETTERS = convert_ascii_range('a'.charCodeAt(0), 'z'.charCodeAt(0));
const CAPITALS = convert_ascii_range('A'.charCodeAt(0), 'Z'.charCodeAt(0));
const NUMBERS = convert_ascii_range('0'.charCodeAt(0), '9'.charCodeAt(0));

function generate_string() {
	const len = parseInt(length_input.value);
	let character_list: string[] = [...LETTERS];
	if(include_captials.checked)
		character_list = character_list.concat(CAPITALS);
	if(include_numbers.checked)
		character_list = character_list.concat(NUMBERS);
	if(include_underline.checked)
		character_list.push('_');
	if(include_dash.checked)
		character_list.push('-');
	if(include_pound.checked)
		character_list.push('#');
	if(include_dollar.checked)
		character_list.push('$');
	if(include_dot.checked)
		character_list.push('.');
	const str: string[] = Array.apply(null, new Array(len)).map((_) => random_select_element(character_list));

	const result = str.join('');
	textbox.innerHTML = result;
	navigator.clipboard.writeText(result);
}
