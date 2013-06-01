game = {

    scene: null,
    camera: null,


	init: function() {

        // load Physijs worker & ammo
        'use strict';
        Physijs.scripts.worker = 'js/physijs_worker.js';
        Physijs.scripts.ammo = 'ammo.js';

        // add scene
        game.scene = new Physijs.Scene();
        game.scene.setGravity(new THREE.Vector3(0, -1000, 0));

        // add camera
        game.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100000);
        game.camera.position.z = 375;
        game.camera.position.y = 75;
        game.camera.position.x = -150;

	},

	render: function() {

	},

	animate: function() {

	},

	update: function() {
		
	}

}

//$(game.init);
