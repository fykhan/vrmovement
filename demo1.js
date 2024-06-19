import "./controllers.js"; // Adds locomotion
import {
	renderer,
	scene,
	cameraGroup,
	camera,
	floor,
	controls
} from './scene.js';
import { rafCallbacks } from "./controllers.js";




function render(time) {

    rafCallbacks.forEach(cb => cb(time));
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
