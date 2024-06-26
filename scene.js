/* eslint-disable no-case-declarations */
import { OrbitControls } from 'three/addons/Addons.js'
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';

const cameraGroup = new THREE.Group();
const scene = new THREE.Scene()
const gridHelper = new THREE.GridHelper(1000, 1000);
scene.add(gridHelper);
scene.background = new THREE.Color(0x87ceeb);

const light = new THREE.DirectionalLight(0xffaa33, 2);

scene.add(light);

const light2 = new THREE.AmbientLight(0x003973, 2);
scene.add(light2);

// Add the light to the scene
const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
)
camera.position.set(0, 1.6, -5);
camera.add(light);

cameraGroup.add(camera);
scene.add(cameraGroup);

const dummyCamera = new THREE.Object3D();
camera.add(dummyCamera);

cameraGroup.quaternion.copy(camera.quaternion);

const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.5;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 1000, 1000),
    new THREE.MeshPhongMaterial({
        color: 0x41980a,
        // wireframe: true,
    })
);
floor.rotation.x = Math.PI / -2;
floor.position.y = -0.001;
scene.add(floor);

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshPhongMaterial({
        color: 0x108810,
        // wireframe: true,
    })
);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');
loader.setDRACOLoader(dracoLoader);

loader.load('models/gltf/LittlestTokyo.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set( 0.03,0.03,0.03 );
    model.position.set( -10, 6, -15 );

    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

const manager = new THREE.LoadingManager();

const mfloader = new ThreeMFLoader( manager );
mfloader.load( './models/3mf/truck.3mf', function ( object ) {

    object.traverse( function ( child ) {

        child.castShadow = true;

    } );
    object.scale.set( 0.1, 0.1, 0.1 );
    object.position.set( 5, -1.12, 10 );
    object.rotation.set(-Math.PI/2, 0,Math.PI/2)
    scene.add( object );

} );

cube1.position.x = -10;
cube1.position.y = 1;
cube1.position.z = -10;
scene.add(cube1);

const cube2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 2, 4, 8),
    new THREE.MeshPhongMaterial({
        color: 0x101010,
        // wireframe: true,
    })
);
cube2.position.x = 10;
cube2.position.y = 2;
cube2.position.z = -10;
scene.add(cube2);

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 4, 1),
    new THREE.MeshPhongMaterial({
        color: 0x88ffff,
        // wireframe: true,
    })
);
cube3.position.x = -10;
cube3.position.y = 2;
cube3.position.z = 10;
scene.add(cube3);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};



// const rafCallbacks = new Set();

// rafCallbacks.add(function (t) {
// 	water.material.normalMap.offset.x += 0.01 * Math.sin(t / 10000)/sceneRadius;
// 	water.material.normalMap.offset.y += 0.01 * Math.cos(t / 8000)/sceneRadius;
// 	water.material.normalScale.x = 10 * (0.8 + 0.5 * Math.cos(t / 1000));
// 	water.material.normalScale.y = 10 * (0.8 + 0.5 * Math.sin(t / 1200));
// 	water.position.y = 0.4 + 0.1 * Math.sin(t / 2000);
// });

renderer.setAnimationLoop(function (time) {
	renderer.render(scene, camera);
});

export {
	renderer,
	scene,
	cameraGroup,
	camera,
	floor,
	controls, 

}