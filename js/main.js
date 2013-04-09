$(document).ready(function() {

    'use strict';

    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';

    var camera, scene, renderer, geometry, controls, material, mesh, keyboard, clock;

    init();
    render();

});

function init() {

    keyboard = new KeyboardState();
    clock = new THREE.Clock();

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -100, 0));

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 300;
    camera.position.y = 50;
    camera.position.x = -100;
    scene.add(camera);

    var groundTexture = THREE.ImageUtils.loadTexture('images/grid_cool.jpg');
    var groundMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: groundTexture }),
        0.8,
        0.4
    );
    var ground = new Physijs.BoxMesh(new THREE.CubeGeometry(250, 5, 250), Physijs.createMaterial(groundMaterial, 0.2, 1.0), 0);
    ground.position.y = - 50;
    scene.add(ground);

    var platform = new Physijs.BoxMesh(new THREE.CubeGeometry(250, 5, 250), Physijs.createMaterial(groundMaterial, 0.2, 1.0), 0);
    platform.position.x = 500;
    scene.add(platform);

    geometry = new THREE.SphereGeometry(15, 32, 32);
    var boxTexture = THREE.ImageUtils.loadTexture('images/custom_crate.jpg');
    var boxMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: boxTexture }),
        10,
        0
    );
    mesh = new Physijs.SphereMesh(geometry, boxMaterial);
    mesh.position.set(0, 30, 0);
    scene.add(mesh);

    controls = new THREE.TrackballControls( camera );

    camera.lookAt(mesh.position);

    var light = new THREE.PointLight( 0xFFFF00 );
    light.position.set(250, 250, 250 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

    render();

}

function render() {

    update();
    scene.simulate();

    controls.update();
    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
    requestAnimationFrame(render);

}

function update() {
    var delta = clock.getDelta(); // seconds.
    var moveDistance = 200 * delta; // 200 pixels per second

    var dirCameraZ;
    switch(true) {
        case keyboard.pressed('Z'):
            dirCameraZ = (new THREE.Vector3(0, 0, -1)).applyMatrix4(camera.matrixWorld);
            break;
        case keyboard.pressed('S'):
            dirCameraZ = (new THREE.Vector3( 0, 0, 1 )).applyMatrix4(camera.matrixWorld);
            break;
        case keyboard.pressed("Q"):
            dirCameraZ = (new THREE.Vector3( -1, 0, 0 )).applyMatrix4(camera.matrixWorld);
            break;
        case keyboard.pressed('D'):
            dirCameraZ = (new THREE.Vector3( 1, 0, 0 )).applyMatrix4(camera.matrixWorld);
    }

    if(dirCameraZ !== undefined) {
        var dirCamera = dirCameraZ.sub( camera.position).normalize();
        dirCamera.y = 0;
        mesh.applyCentralForce(dirCamera.multiplyScalar(1e8*0.05));
    }

    if ( keyboard.pressed("space") ) {
        console.log("Pressed space");
        mesh.applyCentralImpulse(new THREE.Vector3(0, 1e8*0.002, 0))
    }
}
