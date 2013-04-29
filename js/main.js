// is DOM fully loaded?
$(document).ready(function() {

    // load Physijs worker & ammo
    'use strict';
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';

    // set global variables
    var scene, camera, renderer, geometry, controls, material, mesh, keyboard, clock;
    var test;

    // initialize game
    init();

    // render game
    render();

});

// initialize game
function init() {

    // add scene
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -1500, 0));

    // add camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;

    keyboard = new KeyboardState();
    clock = new THREE.Clock();

    var floorTexture = THREE.ImageUtils.loadTexture('img/grid_cool.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 8, 8 );

    var floorMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: floorTexture }),
        10,
        5
    );

    var floor = new Physijs.BoxMesh(new THREE.CubeGeometry(1000, 5, 1000), Physijs.createMaterial(floorMaterial, 0.2, 1.0), 0);
    scene.add(floor);

    geometry = new THREE.SphereGeometry(16, 32, 32);
    var boxTexture = THREE.ImageUtils.loadTexture('img/custom_crate.jpg');
    var boxMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: boxTexture }),
        10,
        0.3
    );
    mesh = new Physijs.SphereMesh(geometry, boxMaterial, 2500);
    mesh.position.set(50, 60, 0);
    scene.add(mesh);

    scene.add(camera);
    //camera.lookAt(mesh.position);




    // skybox
    var urlPrefix   = "img/skybox/";
    var urls = [ urlPrefix + "sky_rt.jpg", urlPrefix + "sky_lf.jpg",
            urlPrefix + "sky_up.jpg", urlPrefix + "sky_dn.jpg",
            urlPrefix + "sky_fr.jpg", urlPrefix + "sky_bk.jpg" ];
    var textureCube = THREE.ImageUtils.loadTextureCube( urls );

    var shader  = THREE.ShaderLib["cube"];
    shader.uniforms["tCube"].texture = textureCube;
    var material = new THREE.ShaderMaterial({
        fragmentShader  : shader.fragmentShader,
        vertexShader    : shader.vertexShader,
        uniforms    : shader.uniforms
    });
    console.log(urls);
    skyboxMesh  = new THREE.Mesh( new THREE.CubeGeometry( 2000, 2000, 2000, 1, 1, 1, null, true ), material );

    scene.add( skyboxMesh );





    // add controls
    controls = new THREE.OrbitControls(camera);
    controls.userRotateSpeed = 3;
    controls.userPanSpeed = 100;
    //controls.minPolarAngle = (2/5)*Math.PI;
    controls.maxPolarAngle = (2/5)*Math.PI;
    controls.minDistance = 600;
    controls.maxDistance = 600;

    var light = new THREE.PointLight( 0xFFFF00 );
    light.position.set(250, 250, 250 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
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

    dafuq();
    controls.center = mesh.position;
    controls.update();

    scene.simulate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);

}

function dafuq() {
    /*var distance = camera.position.distanceTo(mesh.position);
    camera.translateZ(-(distance-400));*/
}

function update() {

    var delta = clock.getDelta(); // seconds.
    var moveDistance = 200 * delta; // 200 pixels per second

    var v;
    switch(true) {
        case keyboard.pressed('Z'):
            v = new THREE.Vector3(0, 0, -1);
            console.log("Pressed Z");
            break;
        case keyboard.pressed('S'):
            v = new THREE.Vector3( 0, 0, 1 );
            console.log("Pressed S");
            break;
        case keyboard.pressed("Q"):
            v = new THREE.Vector3(-1, 0, 0 );
            console.log("Pressed Q");
            break;
        case keyboard.pressed('D'):
            v = new THREE.Vector3( 1, 0, 0 );
            console.log("Pressed D");

    }

    if(v !== undefined) {
        var dirCameraZ = v.applyMatrix4(camera.matrixWorld);
        var dirCamera = dirCameraZ.sub( camera.position).normalize();
        dirCamera.y = 0;
        mesh.applyCentralForce(dirCamera.multiplyScalar(1e8*0.05));
    } else {
        test = null;
    }

    if ( keyboard.pressed("space") ) {
        console.log("Pressed space");
        mesh.applyCentralImpulse(new THREE.Vector3(0, 1e8*0.002, 0))
    }
}
