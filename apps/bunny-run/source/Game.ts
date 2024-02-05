import { Camera } from "./Camera.js";
import { Mesh } from "./Mesh.js";
import { Scene } from "./Scene.js";
import * as g from './globals.js';
import * as math from './math.js';
import { renderText } from "./Text.js";

// Left, middle, right
export const boxHorizontalPositions = [-2, 0, 2];
type MeshDictionary = {
	pointCube: Mesh,
	faintCube1: Mesh,
	faintCube2: Mesh,
	background: Mesh,
	ground: Mesh,
	bunny: Mesh,
};

export class Game {
	scene: Scene;
	meshes: MeshDictionary;
	points: number = 0;
	rotating: boolean = false;
	rotationAngle: number = 0.0;
	horizontal: number = 0.0;
	static readonly boxOffset: number = 20.0;
	constructor(camera: Camera, meshes: MeshDictionary) {
		this.scene = new Scene(camera, Object.values(meshes));
		this.meshes = meshes;
		let backgroundImage = new Image();
		backgroundImage.src = 'asset/sky.jpg';
		// Setting the background image texture asynchonously
		backgroundImage.onload = () => {
			meshes.background.setTexture(backgroundImage);
		}
		// At the start, we can put the boxes a bit nearer.
		// Bunny starts pretty slow, so it will not be a problem.
		this.putBoxes(Game.boxOffset);
	}

	restart() {
		// It is actually an assumption that the objects (including the camera) are
		// put at the `g.XStartTranslation` (and of course bunny rotated with `g.bunnyStartRotaion`)
		// but it is pretty reasonable and I have not broken it so far.
		this.scene.camera.position = new Float32Array(g.cameraStartTranslation);
		this.meshes.background.translation = new Float32Array(g.backgroundStartTranslation);
		this.meshes.bunny.translation = new Float32Array(g.bunnyStartTranslation);
		this.meshes.bunny.rotation = new Float32Array(g.bunnyStartRotation);
		this.meshes.ground.translation = new Float32Array(g.groundStartTranslation);

		// Reset the game state
		this.points = 0;
		this.rotating = false;
		this.rotationAngle = 0.0;
		this.horizontal = 0.0;

		// Put boxes with offset. See the `constructor`.
		this.putBoxes(Game.boxOffset);

		// Of course, restart the game if it is paused.
		g.settings.running = true;
	}

	private getSpeed() {
		// This is a _very_ arbitrary function. I used 2f'(x) where f(x) = x^(1.2).
		// Feel free to experiment with it. Any monotonically increasing function
		// should suffice. Note that if you want your bunny to move according to a
		// function f(points), you should return f'(points) from this function, since
		// this function is used to increase the position/rotation of the meshes.
		return 1.2 * Math.pow(this.points, 0.2) * 2.0;
	}

	private putBoxes(offset: number = 0) {
		// We put boxes in front of the background a bit nearer to the camera by `offset`.
		// Note that camera looks to -Z, so adding a positive offset get the object
		// neraer to the camera if it is in front of it.
		const boxZ = this.meshes.background.translation[2] + offset;

		// We choose a random number in range [0,2] inclusive.
		const pointIndex = Math.floor(Math.random() * 3);
		// It is used to select which the horizontal position of the box
		// which is the one that gives us the points.
		const pointChoice = boxHorizontalPositions[pointIndex];
		// We can then use the next and the next-next positions as the positions
		// for the other boxes. However, if the random index is not 0, the indices will
		// be out of bounds. To prevent this, we can actually wrap around using the modulo.
		// - If 0 is chosen, faint1 becomes 1, faint2 becomes 2
		// - If 1 is chosen, faint1 becomes 2, faint2 becomes (3 % 3) = 0
		// - If 2 is chosen, faint1 becomes (3 % 3) = 0, faint2 becomes (4 % 3) = 1
		// Hence, there will be no problem to choose the others.
		// Note that the order of faint1 and faint2 is not important.
		const faint1Choice = boxHorizontalPositions[(pointIndex + 1) % boxHorizontalPositions.length];
		const faint2Choice = boxHorizontalPositions[(pointIndex + 2) % boxHorizontalPositions.length];

		this.meshes.pointCube.translation[0] = pointChoice;
		this.meshes.pointCube.translation[2] = boxZ;
		this.meshes.faintCube1.translation[0] = faint1Choice;
		this.meshes.faintCube1.translation[2] = boxZ;
		this.meshes.faintCube2.translation[0] = faint2Choice;
		this.meshes.faintCube2.translation[2] = boxZ;

		// Since we do not use the setter of `translation`, we should manually set the
		// transform matrices.
		this.meshes.pointCube.setTransformMatrix();
		this.meshes.faintCube1.setTransformMatrix();
		this.meshes.faintCube2.setTransformMatrix();

		// After being put, all the boxes are active.
		this.meshes.pointCube.active = true;
		this.meshes.faintCube1.active = true;
		this.meshes.faintCube2.active = true;
	}

	private doesIntersect(cube: Mesh) {
		// Both the abs(bunny_x - cube_x) and (bunny_z - cube_z) thresholds are arbitrary.
		// This checks that whether "the bunny is around the same line with the bunny horizontally" and
		// "the bunny has passed the cube or it has not but very near to the cube".
		return (
			(Math.abs(this.meshes.bunny.translation[0] - cube.translation[0]) < 0.5) &&
			(this.meshes.bunny.translation[2] - cube.translation[2]) < 0.5
		);
	}

	private point() {
		// Arbitrary point increment.
		this.points += 10;

		// Rotation animation
		this.rotating = true;
		this.rotationAngle = 0.0;
		this.meshes.bunny.rotation = new Float32Array(g.bunnyStartRotation);
	}

	private faint() {
		// If you ask the reason of the signs of the rotations (why both Y and Z rotations are negative),
		// you may try to look to the rotations' directions backwards.
		// The cartesian coordinate system shows us this. Clockwise rotation is negative (by definition),
		// and it causes such a rotation when we look at the coordinate system towards -Z, not +Z.
		this.meshes.bunny.rotation = math.add(g.bunnyStartRotation, new Float32Array([0, 0, -Math.PI / 2]));

		// Stop updating the game until restart or page refresh.
		g.settings.running = false;
	}

	update(dt: number) {
		// All the cubes are aligned horizontally, so checking only one of them is enough.
		// If camera_z < cube_z, this means that cube is now at the back of the camera, so that
		// the boxes are passed. We can then put them to the horizon. `offset` of the `putBoxes`
		// is 0 by default.
		if ((this.scene.camera.position[2] - this.meshes.pointCube.translation[2]) < 0) {
			this.putBoxes();
		}

		// Apply intersection if and only if the cube is active, and then deactivate the
		// the if it is intersected.
		if (this.meshes.pointCube.active && this.doesIntersect(this.meshes.pointCube)) {
			this.meshes.pointCube.active = false;
			this.point();
		}
		if (this.meshes.faintCube1.active && this.doesIntersect(this.meshes.faintCube1)) {
			this.meshes.faintCube1.active = false;
			this.faint();
		}
		if (this.meshes.faintCube2.active && this.doesIntersect(this.meshes.faintCube2)) {
			this.meshes.faintCube2.active = false;
			this.faint();
		}

		// Rotation animation logic
		if (this.rotating) {
			// `dAngle` is the angle change.
			// We can get the total time to rotate by multiplying with 2pi.
			const dAngle = this.getSpeed() * dt * 5 / Math.PI;
			this.rotationAngle += dAngle;
			this.meshes.bunny.rotation = math.add(this.meshes.bunny.rotation, new Float32Array([0, dAngle, 0]));

			// Rotation end
			if (this.rotationAngle >= 2 * Math.PI) {
				this.rotating = false;
				this.rotationAngle = 0.0;
				this.meshes.bunny.rotation = new Float32Array(g.bunnyStartRotation);
			}
		}

		// How much everything moves in this update tick.
		const globalOffset = math.mul(new Float32Array([0, 0, -this.getSpeed()]), 0.1);

		// How much should the bunny move horizontally _if_ it actually should move.
		const horizontalVector = this.getSpeed() * 0.05;

		// Decimal part of the `points` times a constant and the speed. The constant is arbitrary,
		// increasing it will increase the jumping frequency.
		const pointsDecimal = (this.points * g.bunnyJumpFrequency * this.getSpeed()) -
			Math.floor(this.points * g.bunnyJumpFrequency * this.getSpeed());

		// A chainsaw function in range [0, `g.bunnyJumpHeight`].
		const bunnyY = pointsDecimal < 0.5 ? (pointsDecimal * g.bunnyJumpHeight) : ((1 - pointsDecimal) * g.bunnyJumpHeight);

		if (g.keys['KeyA'] === true) {
			this.horizontal -= horizontalVector;
		}
		if (g.keys['KeyD'] === true) {
			this.horizontal += horizontalVector;
		}

		// We clamp to prevent the bunny from going out of the platform.
		this.horizontal = math.clamp(this.horizontal, -4, 4);

		this.meshes.background.translation = math.add(this.meshes.background.translation, globalOffset);
		this.meshes.bunny.translation[0] = this.horizontal;
		this.meshes.bunny.translation[1] = bunnyY;
		this.meshes.bunny.translation[2] += globalOffset[2];
		this.meshes.bunny.setTransformMatrix();
		this.meshes.ground.translation = math.add(this.meshes.ground.translation, globalOffset);
		this.scene.camera.position = math.add(this.scene.camera.position, globalOffset);

		this.points += dt;
	}

	render() {
		this.scene.render();

		// Here, the `Number(g.settings.running)` actually returns 1 if the game runs or 0 if not.
		// Since the only difference between red and yellow is the green channel being whether 1 or 0,
		// this expression will actually be the value of the green channel of the text color.
		// To prevent the small precision errors' long decimals, we can round our number. 100 is a nice
		// constant to multiply, the speed of increase of the digits are nice for it. Feel free to change it.
		renderText(`Score: ${Math.round(this.points * 100)}`, new Float32Array([1, Number(g.settings.running), 0]), g.settings.height * 0.05);
	}
}
