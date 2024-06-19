import {
	scene, renderer, cameraGroup, camera
} from './scene.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import {
	gamepad, rafCallbacks
} from './gamepad.js';
import * as THREE from 'three';

function positionAtT(inVec,t,p,v,g) {
	inVec.copy(p);
	inVec.addScaledVector(v,t);
	inVec.addScaledVector(g,0.5*t**2);
	return inVec;
}

function locomotion(offset) {
    cameraGroup.position.add(offset);
}

// Utility Vectors
const g = new THREE.Vector3(0,-9.8,0);
const tempVec = new THREE.Vector3();
const tempVec1 = new THREE.Vector3();
const tempVecP = new THREE.Vector3();
const tempVecV = new THREE.Vector3();

// The guideline
const lineSegments=10;
const lineGeometry = new THREE.BufferGeometry();
const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);
lineGeometryVertices.fill(0);
const lineGeometryColors = new Float32Array((lineSegments +1) * 3);
lineGeometryColors.fill(0.5);
lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineGeometryVertices, 3));
lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineGeometryColors, 3));
const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
const guideline = new THREE.Line( lineGeometry, lineMaterial );

// The light at the end of the line
const guidelight = new THREE.PointLight(0xffeeaa, 0, 2);

// The target on the ground
const guidespriteTexture = new THREE.TextureLoader().load('./models/pictures/target.png');
const guidesprite = new THREE.Mesh(
	new THREE.PlaneGeometry(0.3, 0.3, 1, 1),
	new THREE.MeshBasicMaterial({
		map: guidespriteTexture,
		blending: THREE.AdditiveBlending,
		color: 0x555555,
		transparent: true
	})
);
guidesprite.rotation.x = -Math.PI/2;

const controller1 = renderer.xr.getController(0);
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
cameraGroup.add(controller1);
let guidingController = null;

const controller2 = renderer.xr.getController(1);
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);
cameraGroup.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip(0);
const model1 = controllerModelFactory.createControllerModel( controllerGrip1 );
controllerGrip1.add( model1 );
cameraGroup.add( controllerGrip1 );

const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
const model2 = controllerModelFactory.createControllerModel( controllerGrip2 );
controllerGrip2.add( model2 );
cameraGroup.add( controllerGrip2 );

function onSelectStart() {
	console.log("selectstart");
	guidingController = this;
	guidelight.intensity = 1;
	this.add(guideline);
	scene.add(guidesprite);
}

function onSelectEnd() {
	console.log("selectend");
	if (guidingController === this) {

		// first work out vector from feet to cursor

		// feet position
		const feetPos = renderer.xr.getCamera(camera).getWorldPosition(tempVec);
		feetPos.y = 0;

		// cursor position
		const p = guidingController.getWorldPosition(tempVecP);
		const v = guidingController.getWorldDirection(tempVecV);
		v.multiplyScalar(6);
		const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
		const cursorPos = positionAtT(tempVec1,t,p,v,g);

		// Offset
		const offset = cursorPos.addScaledVector(feetPos ,-1);

		// Do the locomotion
		locomotion(offset);

		// clean up
		guidingController = null;
		guidelight.intensity = 0;
		this.remove(guideline);
		scene.remove(guidesprite);
	}
}

rafCallbacks.add(() => {
	if (guidingController) {
		// Controller start position
		const p = guidingController.getWorldPosition(tempVecP);

		// Set Vector V to the direction of the controller, at 1m/s
		const v = guidingController.getWorldDirection(tempVecV);

		// Scale the initial velocity to 6m/s
		v.multiplyScalar(6);

		// Time for tele ball to hit ground
		const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;

		const vertex = tempVec.set(0,0,0);
		for (let i=1; i<=lineSegments; i++) {

			// set vertex to current position of the virtual ball at time t
			positionAtT(vertex,i*t/lineSegments,p,v,g);
			guidingController.worldToLocal(vertex);
			vertex.toArray(lineGeometryVertices,i*3);
		}
		guideline.geometry.attributes.position.needsUpdate = true;

		// Place the light and sprite near the end of the poing
		positionAtT(guidelight.position,t*0.98,p,v,g);
		positionAtT(guidesprite.position,t*0.98,p,v,g);
	}
});

function handleMove({detail}) {
	// Turn left
	console.log(detail.value);
	if (detail.value > 0) {
		cameraGroup.rotation.y -= Math.PI/4;
	}
	// Turn right
	if (detail.value < 0) {
		cameraGroup.rotation.y += Math.PI/4;
	}
}
gamepad.addEventListener('axes0MoveMiddle', handleMove, true);
gamepad.addEventListener('axes2MoveMiddle', handleMove, true);

function handleUp() {
	console.log("up");
	const direction = camera.getWorldDirection(tempVec);
	
	const stepSize = 0.5;
	direction.multiplyScalar(stepSize);
	locomotion(direction);

}

// function handleUpEnd({detail}) {
// 	onSelectEnd.bind(detail.controller)();
// }
gamepad.addEventListener('axes1MoveMiddle', handleUp, true);
gamepad.addEventListener('axes3MoveMiddle', handleUp, true);
// gamepad.addEventListener('axes1MoveEnd', handleUpEnd, true);
// gamepad.addEventListener('axes3MoveEnd', handleUpEnd, true);

export {
	controller1,
	controller2,
	controllerGrip1,
	controllerGrip2, 
	rafCallbacks
}