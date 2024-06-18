import * as THREE from 'three'
import { VRButton } from 'three/addons/webxr/VRButton.js'
import { TeleportVR } from 'three/addons/TeleportVR.js'
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OrbitControls } from 'three/addons/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';

const scene = new THREE.Scene()
const gridHelper = new THREE.GridHelper(1000, 1000);
scene.add(gridHelper);
scene.background = new THREE.Color(0x87ceeb);

// Create a point light with color white and intensity 1
const light = new THREE.PointLight(0xffffff, 1000);

// Set the position of the light to be at the top
light.position.set(0, 30, 0);
light.lookAt(0, 0, 0);

// Add the light to the scene
scene.add(light);

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
)
camera.position.set(0, 1.6, 3)

const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);

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

const teleportVR = new TeleportVR(scene, camera);

const controllerModelFactory0 = new XRControllerModelFactory();

const controllerGrip0 = renderer.xr.getControllerGrip(0)
controllerGrip0.add(controllerModelFactory0.createControllerModel(controllerGrip0));

controllerGrip0.addEventListener('connected', (e) => {
    console.log("controller connected");
    teleportVR.add(0, controllerGrip0, e.data.gamepad);
    console.log(controllerGrip0.position);  
});

const controllerModelFactory1 = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip(1);
controllerGrip1.add(controllerModelFactory1.createControllerModel(controllerGrip1));

controllerGrip1.addEventListener('connected', (e) => {
    teleportVR.add(1, controllerGrip1, e.data.gamepad);
    controllerGrip1.add(controllerModelFactory1.createControllerModel(controllerGrip1));
    console.log(e.data.gamepad);
});



function render() {

    teleportVR.update();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
