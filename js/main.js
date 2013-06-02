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
    init();

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
    renderer.antialias = true;

    $('#container').append(renderer.domElement);

    // add scene
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -1000, 0));

    // add camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;
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
    controls.minDistance = 600;
    controls.maxDistance = 600;

    // add light
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

    //To use enter the axis length
    debugaxis(10000);





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
    platform2Constraint.setLinearUpperLimit(new THREE.Vector3(400, 0, 0));
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
    floor2.position.set(1025, 360, -500);
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
        new THREE.CubeGeometry(250, 250, 250),
        new THREE.MeshFaceMaterial(punch1Materials),
        10000
    );
    punch1.position.set(1400, 500, -625);
    scene.add(punch1);

    punch1Constraint = new Physijs.DOFConstraint(
        punch1, null, punch1.position
    );
    scene.addConstraint(punch1Constraint);
    punch1Constraint.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    punch1Constraint.setLinearUpperLimit(new THREE.Vector3(-1000, 0, 0));
    punch1Constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    punch1Constraint.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));




    var boxTexture = THREE.ImageUtils.loadTexture('img/custom_crate.jpg');
    marble = new Physijs.SphereMesh(
        new THREE.SphereGeometry(16, 32, 32),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: boxTexture }),
            1,
            0.8
        ),
        1500
    );
    //marble.setLinearFactor(new THREE.Vector3( 1, 0, 1 )); // does this work?
    marble.castShadow = true;
    marble.position.set(0, 500, 0);
    scene.add(marble);
    marble.setDamping(null, 0.96); // after add to scene!!!

    marble.addEventListener('collision', function() {
        allowJump = true;
        allowMovement = true;
    });








    var gemTexture = THREE.ImageUtils.loadTexture('img/grid_cool4.jpg');
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
    gem = new Physijs.BoxMesh(
        new THREE.CubeGeometry(30, 30, 30),
        new THREE.MeshFaceMaterial(materials),
        1000
    );
    gem.position.set(200, 60, 400)
    scene.add(gem);

    gemCon = new Physijs.DOFConstraint(
        gem, null, gem.position
    );
    scene.addConstraint(gemCon);
    gemCon.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    gemCon.setLinearUpperLimit(new THREE.Vector3(0, 0, 0));
    gemCon.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    gemCon.setAngularUpperLimit(new THREE.Vector3(2*Math.PI, 0, 2*Math.PI));
    gemCon.configureAngularMotor( 0, 0, 2*Math.PI, 1, 1000 );
    gemCon.configureAngularMotor( 2, 0, 2*Math.PI, 1, 1000 );

    /*test = new Physijs.DOFConstraint(
        other, null, other.position
    );
    scene.addConstraint(test);
    test.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    test.setLinearUpperLimit(new THREE.Vector3(400, 0, 0));
    test.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    test.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));*/






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

    gemCon.enableAngularMotor(0);
    gemCon.enableAngularMotor(2);

    punch1.setLinearVelocity({x: 300 * dirPunch, y: 0, z: 0});
    if(Math.ceil(punch1.position.x) > 1390) dirPunch = -1;
    if(Math.ceil(punch1.position.x) < 610) dirPunch = 1;

    platform2.setLinearVelocity({x: 100 * dir, y: 0, z: 0});
    if(Math.ceil(platform2.position.x) > 770) dir = -1;
    if(Math.ceil(platform2.position.x) < 380) dir = 1;

    platform1.setLinearVelocity({x: 0, y: 100 * dirAgain, z: 0});
    if(Math.ceil(platform1.position.y) > 360) dirAgain = -1;
    if(Math.ceil(platform1.position.y) < 16) dirAgain = 1;


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
        marble.applyCentralImpulse(new THREE.Vector3(0, 1 * 1e6, 0));
        allowJump = false;
        //allowMovement = false;
        /*scene.setGravity(new THREE.Vector3(0, -1000, 0));
        camera.up.set(0, -1, 0);*/
    }



    //Math.abs(marble.getLinearVelocity().y < 10) // may be removed

}

