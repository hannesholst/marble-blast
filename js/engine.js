Engine = function() {

	// components
	this.renderer = new THREE.WebGLRenderer();
	this.scene = new Physijs.Scene();
	this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    this.controls = new THREE.OrbitControls(camera);
    this.keyboard = new KeyboardState();

    this.init = function() {

        'use strict';
        Physijs.scripts.worker = 'js/physijs_worker.js';
        Physijs.scripts.ammo = 'ammo.js';

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        window.addEventListener( 'resize', onWindowResize, false );

        THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    }

	this.render = function() {

		update();



		scene.simulate();
		renderer.render(scene, camera);
		requestAnimationFrame(render);

	}

    this.update = function() {


    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();

        render();

    }

	

}
