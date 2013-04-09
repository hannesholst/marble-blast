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
    scene.setGravity(new THREE.Vector3(0, -400, 0));

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;

    var groundTexture = THREE.ImageUtils.loadTexture('images/grid_cool.jpg');
    var groundMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: groundTexture }),
        0.8,
        0.4
    );
    var ground = new Physijs.BoxMesh(new THREE.CubeGeometry(250, 5, 250), Physijs.createMaterial(groundMaterial, 0.2, 1.0), 0);
    ground.position.y = 0;
    scene.add(ground);

    var platform = new Physijs.BoxMesh(new THREE.CubeGeometry(250, 5, 250), Physijs.createMaterial(groundMaterial, 0.2, 1.0), 0);
    platform.position.x = 180;
    platform.position.y = 110;
    platform.rotation.z = 70;
    scene.add(platform);

    var level = new Physijs.BoxMesh(new THREE.CubeGeometry(250, 5, 250), Physijs.createMaterial(groundMaterial, 0.2, 1.0), 0);
    level.position.z = 150;
    level.position.y = -150;
    scene.add(level);

    geometry = new THREE.SphereGeometry(15, 32, 32);
    var boxTexture = THREE.ImageUtils.loadTexture('images/custom_crate.jpg');
    var boxMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: boxTexture }),
        10,
        0
    );
    mesh = new Physijs.SphereMesh(geometry, boxMaterial);
    mesh.position.set(0, 60, 0);
    scene.add(mesh);

    scene.add(camera);

    controls = new THREE.OrbitControls(camera);
    controls.rotateSpeed = 10;
    controls.panSpeed = 10;

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

    var v;
    switch(true) {
        case keyboard.pressed('Z'):
            v = new THREE.Vector3(0, 0, -1);
            break;
        case keyboard.pressed('S'):
            v = new THREE.Vector3( 0, 0, 1 );
            break;
        case keyboard.pressed("Q"):
            v = new THREE.Vector3( -1, 0, 0 );
            break;
        case keyboard.pressed('D'):
            v = new THREE.Vector3( 1, 0, 0 );
    }

    if(v !== undefined) {
        var dirCameraZ = v.applyMatrix4(camera.matrixWorld);
        var dirCamera = dirCameraZ.sub( camera.position).normalize();
        dirCamera.y = 0;
        mesh.applyCentralForce(dirCamera.multiplyScalar(1e8*0.05));
    }

    if ( keyboard.pressed("space") ) {
        console.log("Pressed space");
        mesh.applyCentralImpulse(new THREE.Vector3(0, 1e8*0.002, 0))
    }

}
