var result = document.getElementById('result-normal');
result.innerHTML = '20 20\n';
var teams = {
    a: 20,
    b: 20
};
var point_history = [{ a: teams.a, b: teams.b }];
function a(amount) {
    teams.a -= amount;
    update();
}
function b(amount) {
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
    result.innerHTML += "".concat((teams.a < 10 ? ' ' : '') + teams.a.toString(), " ").concat((teams.b < 10 ? ' ' : '') + teams.b.toString(), "\n");
    if (teams.a <= 0) {
        alert("A tarafı kazandı");
        reset();
    }
    if (teams.b <= 0) {
        alert("B tarafı kazandı");
        reset();
    }
}
