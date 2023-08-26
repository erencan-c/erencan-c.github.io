const a_penalty = document.getElementById('a-penalty') as HTMLInputElement;
const b_penalty = document.getElementById('b-penalty') as HTMLInputElement;
const result_penalty = document.getElementById('result-101') as HTMLTextAreaElement;

let penalty_a = 0;
let penalty_b = 0;

function reset_penalty() {
	result_penalty.innerHTML = '';
	penalty_a = 0;
	penalty_b = 0;
}

function calculate_penalties() {
	const diff = penalty_a - penalty_b;
	const status_text = `A: ${penalty_a}\nB: ${penalty_b}\n`;
	if(diff < 0) {
		alert(status_text + `B'nin cezası ${-diff} daha fazla`);
	} else if(diff > 0) {
		alert(status_text + `A'nın cezası ${diff} daha fazla`);
	} else {
		alert(status_text + `Cezalar Eşit`);
	}
}

function enter_penalty() {
	let a = 0;
	let b = 0;
	if(a_penalty.value == '') {
		a = -100;
	} else {
		a = Number(a_penalty.value);
	}
	if(b_penalty.value == '') {
		b = -100;
	} else {
		b = Number(b_penalty.value);
	}
	penalty_a += a;
	penalty_b += b;
	a_penalty.value = '';
	b_penalty.value = '';
	display_penalty(a, b);
}

function calculate_offset(val: number): string {
	const str = val.toString();
	const offset = 5 - str.length;
	return ' '.repeat(offset);
}

function display_penalty(a: number, b: number) {
	result_penalty.innerHTML += `${calculate_offset(a)}${a} ${calculate_offset(b)}${b}\n`;
}
