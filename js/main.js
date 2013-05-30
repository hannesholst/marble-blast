// when DOM loaded
$(document).ready(function() {

    // load Physijs worker & ammo
    'use strict';
    Physijs.scripts.worker = 'js/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    // set global variables
    var constraint, scene, camera, renderer, geometry, controls, material, mesh, keyboard, clock, stats, other, course, test, nice;
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

    /*texture_placeholder = document.createElement( 'canvas' );
    texture_placeholder.width = 128;
    texture_placeholder.height = 128;

    var context = texture_placeholder.getContext( '2d' );
    context.fillStyle = 'rgb( 200, 200, 200 )';
    context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );

    var materials = [

        loadTexture( 'img/skybox/sky_rt.jpg' ), // right
        loadTexture( 'img/skybox/sky_lf.jpg' ), // left
        loadTexture( 'img/skybox/sky_up.jpg' ), // top
        loadTexture( 'img/skybox/sky_dn.jpg' ), // bottom
        loadTexture( 'img/skybox/sky_fr.jpg' ), // back
        loadTexture( 'img/skybox/sky_bk.jpg' )  // front

    ];
    test = new THREE.Mesh( new THREE.CubeGeometry( 3000, 3000, 3000, 7, 7, 7 ), new THREE.MeshFaceMaterial( materials ) );
    test.scale.x = - 1;
    scene.add( test );*/


    // add camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 375;
    camera.position.y = 75;
    camera.position.x = -150;

    keyboard = new KeyboardState();
    clock = new THREE.Clock(true);

    var floorTexture = THREE.ImageUtils.loadTexture('img/wood.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 8, 8 );

    var floor = new Physijs.BoxMesh(
        new THREE.CubeGeometry(3000, 5, 3000),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: floorTexture }),
            1,
            0
        ),
        0
    );
    floor.receiveShadow = true;
    scene.add(floor);

    var otherTexture = THREE.ImageUtils.loadTexture('img/grid_cool.jpg');
    otherTexture.wrapS = otherTexture.wrapT = THREE.RepeatWrapping;
    otherTexture.repeat.set( 4, 4 );

    other = new Physijs.BoxMesh(
        new THREE.CubeGeometry(500, 5, 500),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: otherTexture }),
            10,
            0
        ),
        1000
    );
    other.position.setY(100);
    other.position.setX(0);
    scene.add(other);
    other.castShadow = true;
    other.receiveShadow = true;

    var dafuqTexture = THREE.ImageUtils.loadTexture('img/grid_neutral2.jpg');
    dafuqTexture.wrapS = dafuqTexture.wrapT = THREE.RepeatWrapping;
    dafuqTexture.repeat.set( 4, 4 );

    dafuq = new Physijs.BoxMesh(
        new THREE.CubeGeometry(300, 5, 300),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: dafuqTexture }),
            10,
            0
        ),
        0
    );
    dafuq.position.setY(100);
    dafuq.position.setX(-500);
    dafuq.position.setZ(400);
    scene.add(dafuq);
    dafuq.castShadow = true;
    dafuq.receiveShadow = true;



    test = new Physijs.SliderConstraint(
        other, null, { x: 0, y: 0, z: 0}, new THREE.Vector3(0, 0, 1)
    );
    scene.addConstraint(test);
    test.setLimits(
        0,
        500,
        0,
        0
    );
    test.setRestitution(0.5, 1);
    test.enableLinearMotor(500, 1);

    console.log(test);

    /*test = new Physijs.DOFConstraint(
        other, null, other.position
    );
    scene.addConstraint(test);
    test.setLinearLowerLimit(new THREE.Vector3(0, 0, 0));
    test.setLinearUpperLimit(new THREE.Vector3(0, 300, 0));
    test.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
    test.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));
    console.log(test);*/



    var boxTexture = THREE.ImageUtils.loadTexture('img/custom_crate.jpg');

    mesh = new Physijs.SphereMesh(
        new THREE.SphereGeometry(16, 32, 32),
        Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ map: boxTexture }),
            1,
            1
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

    var light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.shadowDarkness = 0.5;
    light.shadowCameraVisible = true;
    light.position.set(1000, 1000, 1000);
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

function animate() {

    /*other.__dirtyPosition = true;

    if(other.position.x < 0) course = 1;
    if(other.position.x > 300) course = -1;

    other.position.x += 3 * course;*/

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
        console.log(other.position);
    } else if(keyboard.pressed('space') && Math.abs(mesh.getLinearVelocity().y < 10)) {
        mesh.applyCentralForce(new THREE.Vector3(0, 1e8 * delta * 2.5, 0));
    }

}
