import {renderer} from './scene.js';

const prevGamePads = new Map();
const gamepad = new EventTarget();

const rafCallbacks = new Set();


function dispatchEvent(type, detail) {
	const specificEvent = new CustomEvent(type, {detail});

	const generalDetail = {type};
	Object.assign(generalDetail, detail);
	const generalEvent = new CustomEvent('gamepadInteraction', {detail: generalDetail});

	gamepad.dispatchEvent(specificEvent);
	gamepad.dispatchEvent(generalEvent);
}

rafCallbacks.add(() => {
	const session = renderer.xr.getSession();
	let i = 0;
	if (session) for (const source of session.inputSources) {
		if (!source.gamepad) continue;
		const controller = renderer.xr.getController(i++);
		const old = prevGamePads.get(source);
		const data = {
			buttons: source.gamepad.buttons.map(b => b.value),
			axes: source.gamepad.axes.slice(0)
		};
		if (old) {
			data.buttons.forEach((value,i)=>{
				if (value !== old.buttons[i]) {
					console.log('button pressed');
					if (value === 1) {
						dispatchEvent(`button${i}Down`, {value, source, controller,data});
					} else {
						dispatchEvent(`button${i}Up`, {value, source, controller,data});
					}
				}
			});
			let vector = { x: 0, y: 0 };

			data.axes.forEach((value, i) => {
				if (value !== 0) {
					if (i === 2) {
						vector.x = value;
					} else if (i === 3) {
						vector.y = value;
					}
				};			
				if (vector.x !== 0 || vector.y !== 0){
					console.log(vector);
					dispatchEvent(`axesMove`, {value, vector, source, controller, data});
				}
			});

		}
		prevGamePads.set(source, data);
	}
});

export {
	gamepad, rafCallbacks
}