// when DOM loaded
$(document).ready(function() {


    // load Physijs worker & ammo
    'use strict';
    Physijs.scripts.worker = 'js/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    // set global variables
    var constraint, scene, camera, renderer, geometry, controls, material, marble, keyboard, clock, stats, other, test, nice, again, platform;
    var texture_placeholder;
    var allowJump, allowMovement; // warning!!!
    var punch1;

    // initialize game
    console.log("start init");
    init();
    console.log("end init");

    // render game
    render();

});

function loadMaterial(file, mapX, mapY, offsetX, offsetY, friction, restitution) {

    var texture = THREE.ImageUtils.loadTexture('img/' + file);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(mapX, mapY);
    texture.offset.set(offsetX, offsetY);

    return Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: texture }),
        friction,
        restitution
    );

}

// initialize game
function init() {

    var enableShadows = false;
    var collectedGems = 0;

    firewrks = new Audio('sound/firewrks.wav');
    firewrks.volume = 0.6;

    missinggems = new Audio('sound/missinggems.wav');
    missinggems.volume = 0.6;

    gotgem = new Audio('sound/gotgem.wav');
    gotgem.volume = 0.5;

    gotallgems = new Audio('sound/gotallgems.wav');
    gotallgems.volume = 0.6;

    trapdoor = new Audio('sound/trapdooropen.wav');
    trapdoor.volume = 0.5;

    groovepolice = new Audio('sound/groovepolice.ogg');
    groovepolice.volume = 0.2;
    groovepolice.loop = true;

    spawn = new Audio('sound/spawn.wav');
    spawn.volume = 0.4;
    ready = new Audio('sound/ready.wav');
    ready.volume = 0.2;
    set = new Audio('sound/set.wav');
    set.volume = 0.2;
    go = new Audio('sound/go.wav');
    set.volume = 0.3;

    // display FPS stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    $('#container').append(stats.domElement);

    // add renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize($(window).width(), $(window).height());
    renderer.shadowMapEnabled = true;
    //renderer.shadowMapSoft = true;
    //renderer.antialias = true;

    $('#container').append(renderer.domElement);

    // add scene
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -1000, 0));

    var handleIntro = function() {
        setTimeout(function() { ready.play(); }, 0);
        setTimeout(function() { set.play(); }, 1500);
        setTimeout(function() { go.play(); }, 3000);
        setTimeout(function() { groovepolice.play(); }, 4500);
        scene.removeEventListener('update', handleIntro, false);
    };
    scene.addEventListener('update', handleIntro, false);

    // add camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(1000, 270, 700);
    scene.add(camera);

    // add keyboard controls
    keyboard = new KeyboardState();

    // add clock for delta timing
    clock = new THREE.Clock(true);

    // add controls
    controls = new THREE.OrbitControls(camera);
    controls.userRotateSpeed = 5;
    controls.userPanSpeed = 100;
    //controls.minPolarAngle = (2/5)*Math.PI;
    controls.maxPolarAngle = (2/5)*Math.PI;
    controls.minDistance = 800;
    controls.maxDistance = 800;

    // add light
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1000, 1000, 1000);
    light.castShadow = true;
    light.shadowDarkness = 0.6;
    //light.shadowCameraVisible = true;
    //light.shadowCameraNear = 1000;
    //light.shadowCameraFar = 5000;
    light.shadowCameraLeft = -2000;
    light.shadowCameraRight = 2000;
    light.shadowCameraBottom = -2000;
    light.shadowCameraTop = 2000;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    scene.add(light);

    window.addEventListener( 'resize', onWindowResize, false ); // fix this crap!

    // toggle full screen
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

    //debugaxis(10000);





    // add skybox
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

    // add floor1
    var floorMaterial = loadMaterial('grid_cool.jpg', 4, 4, 0, 0, 1, 0.8);
    var floorSideMaterial = loadMaterial('edge_white2.jpg', 20, 1, 0, 0, 0, 0);

    var floorMaterials = [
        floorSideMaterial,
        floorSideMaterial,
        floorMaterial,
        floorMaterial,
        floorSideMaterial,
        floorSideMaterial
    ];

    var floor1 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(1000, 10, 1000),
        new THREE.MeshFaceMaterial(floorMaterials),
        0
    );
    scene.add(floor1);

    // add box1
    var boxMaterial = loadMaterial('grid_cool.jpg', 2, 2, 0, 0, 1, 0);
    var boxSideMaterial = loadMaterial('wall_neutral3.jpg', 4, 1, 0, 0, 0, 0);

    var boxMaterials = [
        boxSideMaterial,
        boxSideMaterial,
        boxMaterial,
        boxMaterial,
        boxSideMaterial,
        boxSideMaterial
    ];

    var box1 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(500, 750, 500),
        new THREE.MeshFaceMaterial(boxMaterials),
        0
    );
    scene.add(box1);

    // add platform1
    var platformMaterial = loadMaterial('grid_neutral2.jpg', 2, 2, 0.5, 0.5, 1, 0);
    var platformSideMaterial = loadMaterial('stripe_caution.jpg', 5, 1, 0, 0, 0, 0);

    var platformMaterials = [
        platformSideMaterial,
        platformSideMaterial,
        platformMaterial,
        platformMaterial,
        platformSideMaterial,
        platformSideMaterial
    ];

    platform1 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(250, 20, 250),
        new THREE.MeshFaceMaterial(platformMaterials),
        10000
    );
    platform1.position.set(-125, 15, 375);
    scene.add(platform1);

    platform1Constraint = new Physijs.DOFConstraint(
        platform1, null, platform1.position
    );
    scene.addConstraint(platform1Constraint);
    platform1Constraint.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    platform1Constraint.setLinearUpperLimit(new THREE.Vector3(0, 400, 0));
    platform1Constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    platform1Constraint.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));

    platform2 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(250, 20, 250),
        new THREE.MeshFaceMaterial(platformMaterials),
        10000
    );
    platform2.position.set(375, 360, -125);
    scene.add(platform2);

    platform2Constraint = new Physijs.DOFConstraint(
        platform2, null, platform2.position
    );
    scene.addConstraint(platform2Constraint);
    platform2Constraint.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    platform2Constraint.setLinearUpperLimit(new THREE.Vector3(650, 0, 0));
    platform2Constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    platform2Constraint.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));

    // add floor2
    var floor2Material = loadMaterial('grid_cool.jpg', 1, 4, 0, 0, 1, 0.8);
    var floor2FrontSideMaterial = loadMaterial('edge_white2.jpg', 20, 1, 0, 0, 0, 0);
    var floor2LeftSideMaterial = loadMaterial('edge_white2.jpg', 5, 1, 0, 0, 0, 0);

    var floor2Materials = [
        floor2FrontSideMaterial,
        floor2FrontSideMaterial,
        floor2Material,
        floor2Material,
        floor2LeftSideMaterial,
        floor2LeftSideMaterial
    ];

    var floor2 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(250, 10, 1000),
        new THREE.MeshFaceMaterial(floor2Materials),
        0
    );
    floor2.position.set(1025, 360, -750);
    scene.add(floor2);


    var punch1Material = loadMaterial('grid_neutral3.jpg', 1, 1, 0, 0, 0, 0);
    var punch1FrontMaterial = loadMaterial('pattern_neutral2.jpg', 4, 4, 0, 0, 0, 0);
    var punch1Materials = [
        punch1FrontMaterial,
        punch1FrontMaterial,
        punch1Material,
        punch1Material,
        punch1Material,
        punch1Material
    ];

    punch1 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(250, 125, 250),
        new THREE.MeshFaceMaterial(punch1Materials),
        10000
    );
    punch1.position.set(1400, 438, -625);
    scene.add(punch1);

    punch1Constraint = new Physijs.DOFConstraint(
        punch1, null, punch1.position
    );
    scene.addConstraint(punch1Constraint);
    punch1Constraint.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    punch1Constraint.setLinearUpperLimit(new THREE.Vector3(-1000, 0, 0));
    punch1Constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    punch1Constraint.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));

    var trap1Material = loadMaterial('custom_woodbox.jpg', 1, 1, 0, 0, 1, 0);
    var trap1Materials = [
        trap1Material,
        trap1Material,
        trap1Material,
        trap1Material,
        trap1Material,
        trap1Material
    ];

    trap1 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(250, 10, 250),
        new THREE.MeshFaceMaterial(trap1Materials),
        1
    );
    trap1.position.set(1276, 360, -1125);
    scene.add(trap1);
    trap1.addEventListener('collision', function(target) {
        if(target._physijs.id == marble._physijs.id) {
            console.log("Trapdoor opened!");
            trapdoor.play();
        }
    });

    trap1Constraint = new Physijs.HingeConstraint(
        trap1,
        null,
        new THREE.Vector3(trap1.position.x-125, trap1.position.y, trap1.position.z),
        new THREE.Vector3(0, 0, 1)
    );
    scene.addConstraint(trap1Constraint);
    trap1Constraint.setLimits(
        0,
        -Math.PI/2,
        0,
        0
    );

    // add floor3
    var floor3Material = loadMaterial('grid_cool.jpg', 2, 1, 0, 0, 1, 0.8);
    var floor3FrontSideMaterial = loadMaterial('edge_white2.jpg', 5, 1, 0, 0, 0, 0);
    var floor3LeftSideMaterial = loadMaterial('edge_white2.jpg', 10, 1, 0, 0, 1, 0);

    var floor3Materials = [
        floor3FrontSideMaterial,
        floor3FrontSideMaterial,
        floor3Material,
        floor3Material,
        floor3LeftSideMaterial,
        floor3LeftSideMaterial
    ];

    var floor3 = new Physijs.BoxMesh(
        new THREE.CubeGeometry(500, 10, 250),
        new THREE.MeshFaceMaterial(floor3Materials),
        0
    );
    floor3.position.set(1650, 360, -1125);
    scene.add(floor3);

    var finishMaterial = loadMaterial('grid_neutral4.jpg', 1, 1, 0, 0, 1, 0);
    var finishSideMaterial = loadMaterial('edge_white2.jpg', 5, 1, 0, 0, 0, 0);
    var finishMaterials = [
        finishSideMaterial,
        finishSideMaterial,
        finishMaterial,
        finishMaterial,
        finishSideMaterial,
        finishSideMaterial
    ];

    finish = new Physijs.BoxMesh(
        new THREE.CubeGeometry(250, 10, 250),
        new THREE.MeshFaceMaterial(finishMaterials),
        0
    );
    finish.position.set(2025, 360, -1125);
    finish.addEventListener('collision', function(target) {
        if(target._physijs.id == marble._physijs.id) {
            if(collectedGems == 5) {
                firewrks.play();
            } else {
                missinggems.play();
            }
        }
    });
    scene.add(finish);


    var boxTexture = THREE.ImageUtils.loadTexture('img/custom_crate.jpg');
    marble = new Physijs.SphereMesh(
        new THREE.SphereGeometry(16, 32, 32),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: boxTexture }),
            1,
            0.8
        ),
        1200
    );
    //marble.setLinearFactor(new THREE.Vector3( 1, 0, 1 )); // does this work?
    marble.position.set(375, 50, 375);
    scene.add(marble);
    marble.setDamping(null, 0.96); // after add to scene!!!

    marble.addEventListener('collision', function() {
        allowJump = true;
        allowMovement = true;
    });

    var gemTexture = THREE.ImageUtils.loadTexture('img/pattern_warm1.jpg');
    gemTexture.wrapS = gemTexture.wrapT = THREE.RepeatWrapping;
    gemTexture.repeat.set( 1, 1 );

    var gemMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: gemTexture }),
        0,
        0
    );

    var materials = [
        gemMaterial,
        gemMaterial,
        gemMaterial,
        gemMaterial,
        gemMaterial,
        gemMaterial
    ];

    var gemPositions = [
        new THREE.Vector3(380, 35, -115),
        new THREE.Vector3(-140, 405, -128),
        new THREE.Vector3(580, 405, -130),
        new THREE.Vector3(1020, 395, -900),
        new THREE.Vector3(1530, 395, -1130)
    ];

    var gemObjects = [];
    $.each(gemPositions, function() {
        var gem = new Physijs.BoxMesh(
            new THREE.CubeGeometry(30, 30, 30),
            new THREE.MeshFaceMaterial(materials),
            1000
        )
        gem.position = this;
        gem.addEventListener('collision', function(target) {
            if(target._physijs.id == marble._physijs.id) {
                console.log("Picked up a gem!");
                collectedGems++;
                if(collectedGems == 5) {
                    gotallgems.play();
                } else {
                    gotgem.play();
                }
                scene.remove(gem);
            }
        });
        scene.add(gem);
        gemObjects.push(gem);
    });

    var gemConstraints = [];
    $.each(gemObjects, function() {
        var constraint = new Physijs.DOFConstraint(this, null, this.position);
        scene.addConstraint(constraint);
        constraint.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
        constraint.setLinearUpperLimit(new THREE.Vector3(0, 0, 0));
        constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
        constraint.setAngularUpperLimit(new THREE.Vector3(2*Math.PI, 0, 2*Math.PI));
        constraint.configureAngularMotor( 0, 0, 2*Math.PI, 1, 1000 );
        constraint.configureAngularMotor( 2, 0, 2*Math.PI, 1, 1000 );
        gemConstraints.push(constraint);
        constraint.enableAngularMotor(0);
        constraint.enableAngularMotor(2);
    });



    if(enableShadows) {
        floor1.castShadow = true;
        floor1.receiveShadow = true;
        floor2.castShadow = true;
        floor2.receiveShadow = true;
        floor3.castShadow = true;
        floor3.receiveShadow = true;
        punch1.castShadow = true;
        punch1.receiveShadow = true;
        marble.castShadow = true;
        marble.receiveShadow = true;
        platform1.castShadow = true;
        platform1.receiveShadow = true;
        platform2.castShadow = true;
        platform2.receiveShadow = true;
        finish.castShadow = true;
        finish.receiveShadow = true;
        trap1.castShadow = true;
        trap1.receiveShadow = true;
        box1.castShadow = true;
        box1.receiveShadow = true;

        $.each(gemObjects, function() {
            this.castShadow = true;
            this.receiveShadow = true;
        });

    }


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

    //controls.handleResize();

    //render();

}

function render() {

    updateInput();
    animate();

    stats.update();
    controls.center = marble.position;
    controls.update();

    scene.simulate();
    renderer.render(scene, camera);

    requestAnimationFrame(render);

}
var dir = 1;
var dirAgain = 1;
var dirPunch = 1;
function animate() {

    punch1.setLinearVelocity({x: 400 * dirPunch, y: 0, z: 0});
    if(Math.ceil(punch1.position.x) > 1390) dirPunch = -1;
    if(Math.ceil(punch1.position.x) < 610) dirPunch = 1;

    platform1.setLinearVelocity({x: 0, y: 100 * dirAgain, z: 0});
    if(Math.ceil(platform1.position.y) > 360) dirAgain = -1;
    if(Math.ceil(platform1.position.y) < 16) dirAgain = 1;

    platform2.setLinearVelocity({x: 100 * dir, y: 0, z: 0});
    if(Math.ceil(platform2.position.x) > 1010) dir = -1;
    if(Math.ceil(platform2.position.x) < 380) dir = 1;

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

    if(v !== undefined && allowMovement) {
        var dirCameraZ = v.applyMatrix4(camera.matrixWorld);
        var dirCamera = dirCameraZ.sub(camera.position);
        dirCamera.y = 0;
        marble.applyCentralForce(dirCamera.multiplyScalar(1e8 * delta));
    } else if(keyboard.pressed('space') && allowJump) {
        console.log("ready to jump");
        marble.applyCentralImpulse(new THREE.Vector3(0, 0.7 * 1e6, 0));
        allowJump = false;
    }

}

