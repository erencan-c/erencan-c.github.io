const result = document.getElementById('result-normal') as HTMLInputElement;
result.innerHTML = '20 20\n';

const teams = {
	a: 20,
	b: 20
};

let point_history = [{a: teams.a, b: teams.b}];

function a(amount: number) {
	teams.a -= amount;
	update();
}

function b(amount: number) {
	teams.b -= amount;
	update();
}

function reset() {
	teams.a = 20;
	teams.b = 20;
	result.innerHTML = '';
	update();
}

function update() {
	result.innerHTML += `${(teams.a < 10 ? ' ' : '') + teams.a.toString()} ${(teams.b < 10 ? ' ' : '') + teams.b.toString()}\n` ;
	if(teams.a <= 0) {
		alert("A tarafı kazandı");
		reset();
	}
	if(teams.b <= 0) {
		alert("B tarafı kazandı");
		reset();
	}
}
