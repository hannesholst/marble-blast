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
    scene.setGravity(new THREE.Vector3(0, -1500, 0));

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;

    // skybox
    /*var path = "images/skybox/";
    var format = '.jpg';
    var urls = [
        path + 'sky_lf' + format, path + 'sky_rt' + format,
        path + 'sky_up' + format, path + 'sky_dn' + format,
        path + 'sky_fr' + format, path + 'sky_bk' + format
    ];

    var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
    reflectionCube.format = THREE.RGBFormat;

    var refractionCube = new THREE.Texture( reflectionCube.image, new THREE.CubeRefractionMapping() );
    refractionCube.format = THREE.RGBFormat;

    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = reflectionCube;

    var material = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide

        } ),

    test = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), material );
    scene.add( test );*/


    var groundTexture = THREE.ImageUtils.loadTexture('images/grid_cool.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 8, 8 );
    var groundMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: groundTexture }),
        10,
        5
    );
    var ground = new Physijs.BoxMesh(new THREE.CubeGeometry(1000, 5, 1000), Physijs.createMaterial(groundMaterial, 0.2, 1.0), 0);
    scene.add(ground);

    geometry = new THREE.SphereGeometry(16, 32, 32);
    var boxTexture = THREE.ImageUtils.loadTexture('images/custom_crate.jpg');
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

    controls = new THREE.OrbitControls(camera);
    controls.userRotateSpeed = 3;
    controls.userPanSpeed = 100;
    //controls.minPolarAngle = (2/5)*Math.PI;
    controls.maxPolarAngle = (2/5)*Math.PI;

    var light = new THREE.PointLight( 0xFFFF00 );
    light.position.set(250, 250, 250 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

    console.log(camera.position.distanceTo(mesh.position));
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

    dafuq();
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(render);

}

function dafuq() {
    var distance = camera.position.distanceTo(mesh.position);
    camera.position.x = mesh.position.x;
    camera.translateZ(-(distance-400));
    controls.center = mesh.position;
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
    }

    if ( keyboard.pressed("space") ) {
        console.log("Pressed space");
        mesh.applyCentralImpulse(new THREE.Vector3(0, 1e8*0.002, 0))
    }
}
