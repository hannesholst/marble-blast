// when DOM loaded
$(document).ready(function() {

    // load Physijs worker & ammo
    'use strict';
    Physijs.scripts.worker = 'js/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    // set global variables
    var constraint, scene, camera, renderer, geometry, controls, material, mesh, keyboard, clock, stats, other, course, test, nice, again, platform;
    var texture_placeholder;

    // initialize game
    init();

    // render game
    render();

});

// initialize game
function init() {



    course = -1;

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    $('#container').append(stats.domElement);

    // add scene
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -1000, 0));

    var materials = [
        Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/skybox/sky_rt.jpg') })),
        Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/skybox/sky_lf.jpg') })),
        Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/skybox/sky_up.jpg') })),
        Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/skybox/sky_dn.jpg') })),
        Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/skybox/sky_fr.jpg') })),
        Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/skybox/sky_bk.jpg') }))
    ];
    skybox = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000), new THREE.MeshFaceMaterial( materials ) );
    skybox.scale.x = - 1;
    scene.add(skybox);


    // add camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;

    keyboard = new KeyboardState();
    clock = new THREE.Clock(true);

    var floorTexture = THREE.ImageUtils.loadTexture('img/grid_cool.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 16, 16 );

    var floorMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: floorTexture }),
        1,
        0
    );

    var sideTexture = THREE.ImageUtils.loadTexture('img/edge_white2.jpg');
    sideTexture.wrapS = sideTexture.wrapT = THREE.RepeatWrapping;
    sideTexture.repeat.set( 100, 1 );

    var sideMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: sideTexture }),
        1,
        0
    );

    var materials = [
        sideMaterial,
        sideMaterial,
        floorMaterial,
        floorMaterial,
        sideMaterial,
        sideMaterial
    ];

    var floor = new Physijs.BoxMesh(
        new THREE.CubeGeometry(3000, 50, 3000),
        new THREE.MeshFaceMaterial(materials),
        0
    );
    floor.receiveShadow = true;
    scene.add(floor);






    var platformTexture = THREE.ImageUtils.loadTexture('img/grid_neutral2.jpg');
    platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
    platformTexture.offset.set(0.5, 0.5);
    platformTexture.repeat.set( 2, 2 );

    var platformMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: platformTexture }),
        1,
        0
    );

    var sideTexture = THREE.ImageUtils.loadTexture('img/stripe_caution.jpg');
    sideTexture.wrapS = sideTexture.wrapT = THREE.RepeatWrapping;
    sideTexture.repeat.set( 5, 1 );

    var sideMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: sideTexture }),
        0,
        0
    );

    var materials = [
        sideMaterial,
        sideMaterial,
        platformMaterial,
        platformMaterial,
        sideMaterial,
        sideMaterial
    ];

    platform = new Physijs.BoxMesh(
        new THREE.CubeGeometry(300, 25, 300),
        new THREE.MeshFaceMaterial(materials),
        10000
    );

    platform.position.setY(0);
    platform.position.setX(-500);
    platform.position.setZ(400);
    scene.add(platform);
    platform.castShadow = true;
    platform.receiveShadow = true;

    again = new Physijs.DOFConstraint(
        platform, null, platform.position
    );
    scene.addConstraint(again);
    again.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    again.setLinearUpperLimit(new THREE.Vector3(0, 400, 0));
    again.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    again.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));

    other = new Physijs.BoxMesh(
        new THREE.CubeGeometry(500, 5, 500),
        new THREE.MeshFaceMaterial(materials),
        10000
    );
    other.position.setY(100);
    other.position.setX(0);
    scene.add(other);
    other.castShadow = true;
    other.receiveShadow = true;

    gem = new Physijs.BoxMesh(
        new THREE.OctahedronGeometry(30, 0),
        new THREE.MeshBasicMaterial({ map: sideTexture }),
        1000
    );
    gem.position.set(-200, 100, 300)
    scene.add(gem);

    gemCon = new Physijs.DOFConstraint(
        gem, null, gem.position
    );
    scene.addConstraint(gemCon);
    gemCon.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    gemCon.setLinearUpperLimit(new THREE.Vector3(0, 0, 0));
    gemCon.setAngularLowerLimit(new THREE.Vector3(0, -Math.PI, 0));
    gemCon.setAngularUpperLimit(new THREE.Vector3(0, Math.PI, 0));
    gemCon.configureAngularMotor(1, -Math.PI, Math.PI, 100, 1);
    gemCon.enableAngularMotor(1);

    test = new Physijs.DOFConstraint(
        other, null, other.position
    );
    scene.addConstraint(test);
    test.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    test.setLinearUpperLimit(new THREE.Vector3(400, 0, 0));
    test.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    test.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));

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
    mesh.setLinearFactor(new THREE.Vector3( 1, 0, 1 )); // does this work?
    mesh.castShadow = true;
    mesh.position.set(-200, 50, 200);
    scene.add(mesh);
    mesh.setDamping(null, 0.96);

    scene.add(camera);
    //camera.lookAt(mesh.position);


    // add controls
    controls = new THREE.OrbitControls(camera);
    controls.userRotateSpeed = 3;
    controls.userPanSpeed = 100;
    //controls.minPolarAngle = (2/5)*Math.PI;
    controls.maxPolarAngle = (2/5)*Math.PI;
    controls.minDistance = 800;
    controls.maxDistance = 800;

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1000, 1000, 1000);
    light.castShadow = true;
    light.shadowDarkness = 0.5;
    light.shadowCameraVisible = true;
    //light.shadowCameraNear = 1000;
    //light.shadowCameraFar = 5000;
    light.shadowCameraLeft = -1000;
    light.shadowCameraRight = 1000;
    light.shadowCameraBottom = -1000;
    light.shadowCameraTop = 1000;
    console.log(light);
    scene.add(light);


    renderer = new THREE.WebGLRenderer();
    renderer.setSize($(window).width(), $(window).height());
    renderer.shadowMapEnabled = true;
    //renderer.shadowMapSoft = true;
    //renderer.antialias = true;

    $('#container').append(renderer.domElement);

    //window.addEventListener( 'resize', onWindowResize, false );

    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    var debugaxis = function(axisLength){
        //Shorten the vertex function
        function v(x,y,z){
            return new THREE.Vertex(new THREE.Vector3(x,y,z));
        }

        //Create axis (point1, point2, colour)
        function createAxis(p1, p2, color){
            var line, lineGeometry = new THREE.Geometry(),
                lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat);
            scene.add(line);
        }

        createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
        createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
        createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
    };

//To use enter the axis length
    debugaxis(10000);
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

/*function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    //controls.handleResize();

    render();

}*/

function render() {

    updateInput();
    animate();

    stats.update();
    controls.center = mesh.position;
    controls.update();

    scene.simulate();
    renderer.render(scene, camera);

    requestAnimationFrame(render);

}
var dir = 1;
var dirAgain = 1;
function animate() {

    other.setLinearVelocity({x: 100 * dir, y: 0, z: 0});
    if(Math.ceil(other.position.x) > 350) dir = -1;
    if(Math.ceil(other.position.x) < 50) dir = 1;

    platform.setLinearVelocity({x: 0, y: 100 * dirAgain, z: 0});
    if(Math.ceil(platform.position.y) > 350) dirAgain = -1;
    if(Math.ceil(platform.position.y) < 50) dirAgain = 1;


}

function updateInput() {

    var delta = clock.getDelta();

    var v;
    switch(true) {
        case keyboard.pressed('Z'):
            v = new THREE.Vector3(0, 0, -1);
            break;
        case keyboard.pressed('S'):
            v = new THREE.Vector3( 0, 0, 1 );
            break;
        case keyboard.pressed('Q'):
            v = new THREE.Vector3(-1, 0, 0 );
            break;
        case keyboard.pressed('D'):
            v = new THREE.Vector3( 1, 0, 0 );
    }

    if(v !== undefined) {
        var dirCameraZ = v.applyMatrix4(camera.matrixWorld);
        var dirCamera = dirCameraZ.sub(camera.position);
        dirCamera.y = 0;
        mesh.applyCentralForce(dirCamera.multiplyScalar(1e8 * delta));
    } else if(keyboard.pressed('space') && Math.abs(mesh.getLinearVelocity().y < 10)) {
        mesh.applyCentralForce(new THREE.Vector3(0, 1e8 * delta * 10, 0));
    }

}
