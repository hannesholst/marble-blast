// when DOM loaded
$(document).ready(function() {

    // load Physijs worker & ammo
    'use strict';
    Physijs.scripts.worker = 'js/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    // set global variables
    var scene, camera, renderer, geometry, controls, material, mesh, keyboard, clock;
    var texture_placeholder;
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
    scene.setGravity(new THREE.Vector3(0, -1000, 0));

    texture_placeholder = document.createElement( 'canvas' );
    texture_placeholder.width = 128;
    texture_placeholder.height = 128;

    var context = texture_placeholder.getContext( '2d' );
    context.fillStyle = 'rgb( 200, 200, 200 )';
    context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );

    /*var materials = [

        loadTexture( 'img/skybox/sky_rt.jpg' ), // right
        loadTexture( 'img/skybox/sky_lf.jpg' ), // left
        loadTexture( 'img/skybox/sky_up.jpg' ), // top
        loadTexture( 'img/skybox/sky_dn.jpg' ), // bottom
        loadTexture( 'img/skybox/sky_fr.jpg' ), // back
        loadTexture( 'img/skybox/sky_bk.jpg' )  // front

    ];
    test = new THREE.Mesh( new THREE.CubeGeometry( 3000, 3000, 3000, 7, 7, 7 ), new THREE.MeshFaceMaterial( materials ) );
    test.scale.x = - 1;*/
    //scene.add( test );


    // add camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;

    keyboard = new KeyboardState();
    clock = new THREE.Clock();

    var floorTexture = THREE.ImageUtils.loadTexture('img/grid_cool.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 8, 8 );

    var floor = new Physijs.BoxMesh(
        new THREE.CubeGeometry(1000, 5, 1000),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: floorTexture }),
            1,
            0
        ),
        0
    );
    scene.add(floor);

    var boxTexture = THREE.ImageUtils.loadTexture('img/custom_crate.jpg');

    mesh = new Physijs.SphereMesh(
        new THREE.SphereGeometry(16, 32, 32),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: boxTexture }),
            1,
            0
        ),
        1000
    );
    mesh.position.set(50, 60, 0);
    scene.add(mesh);

    scene.add(camera);
    //camera.lookAt(mesh.position);


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

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
}

function loadTexture( path ) {

    var texture = new THREE.Texture( texture_placeholder );
    var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: true } );

    var image = new Image();
    image.onload = function () {

        texture.needsUpdate = true;
        material.map.image = this;

        render();

    };
    image.src = path;

    return material;

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

    controls.center = mesh.position;
    controls.update();

    scene.simulate();
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
        var dirCamera = dirCameraZ.sub( camera.position);
        dirCamera.y = 0;
        mesh.applyCentralForce(dirCamera.multiplyScalar(1e7*0.3));
    } else {
        var dirCamera = mesh.getLinearVelocity();
        if (Math.abs(dirCamera.x) > 0 || Math.abs(dirCamera.z) > 0) {
            var backupY = dirCamera.y;
            dirCamera.divideScalar(1.02);
            dirCamera.setY(backupY);
            mesh.setLinearVelocity(dirCamera);
        }
    }

    if ( keyboard.pressed("space") && mesh.getLinearVelocity().y < 10 ) {
        console.log("Pressed space");
        mesh.applyCentralImpulse(new THREE.Vector3(0, 1e9*0.002, 0))
    }
}
