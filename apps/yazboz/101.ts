const a_penalty = document.getElementById('a-penalty') as HTMLInputElement;
const b_penalty = document.getElementById('b-penalty') as HTMLInputElement;
const result_penalty = document.getElementById('result-101') as HTMLTextAreaElement;

let diff = 0;

function reset_penalty() {
	result_penalty.innerHTML = '';
	diff = 0;
}

function calculate_penalties() {
	if(diff < 0) {
		alert(`B'nin cezası ${-diff} daha fazla`);
	} else if(diff > 0) {
		alert(`A'nın cezası ${diff} daha fazla`);
	} else {
		alert(`Cezalar Eşit`);
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
	diff += a - b;
}
