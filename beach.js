var scene,
    camera, cameraControls, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

var rotationspeed = 0.05;
var wavespeed = 0.07;
var group = new THREE.Group();
var bird, seaPlane, cloud, cloud1;

var hemisphereLight, shadowLight;

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };
function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();
		
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		alpha: true, 
		antialias: true 
	});
    renderer.setSize(WIDTH, HEIGHT);
 	renderer.shadowMap.enabled = true;

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 0.1;
	farPlane = 1000;
	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
	camera.position.x = -34;
	camera.position.y = 5;
	camera.position.z = 0;

	//Setup OrbitControls
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControls.target = new THREE.Vector3(0, 8, 0);
	cameraControls.minPolarAngle = Math.PI/6; // radians
	cameraControls.maxPolarAngle = Math.PI/2 + 0.1; // radians
	cameraControls.minDistance = 0;
	cameraControls.maxDistance = 45;
    cameraControls.addEventListener( 'change', render ); // remove when using animation loop

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
}
function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xffffff,0xffffff, .9);
	// hemisphereLight.color.setHSL( 0.6, 1, 0.6 );
	// hemisphereLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemisphereLight.position.set( 0, 0, 0);
	shadowLight = new THREE.DirectionalLight(0xffffff, 1.5);
	shadowLight.color.setHSL( 0.1, 1, 0.95 );
	shadowLight.position.set(-15, 20, 20);
	shadowLight.target.position.set(0, 20, 0);
	// shadowLight.castShadow = true;
	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
	if(bird.wing.rotation.z > 0.35 || bird.wing.rotation.z < -0.35) {
		rotationspeed = -1 * rotationspeed;
	}
	bird.wing.rotation.z += rotationspeed;
	bird.wing2.rotation.z -= rotationspeed;
	bird.mesh.position.z += 0.011;

	if(seaPlane.position.z > 20 || seaPlane.position.z < -20) {
		wavespeed = -1 * wavespeed;
	}
	seaPlane.position.z += wavespeed;
	cloud.position.z += wavespeed/6;
	cloud1.position.z += wavespeed/6;
	camera.position.y += wavespeed/6;
    window.requestAnimationFrame(animate);
    cameraControls.update();
    render();
}

function init() {
    createScene();
    createLights();
    createBird();
	var loader = new THREE.ObjectLoader();
	loader.load('./BeachScene.json', function(loadedObj, materials) {
		loadedObj.children.forEach(function(obj) {
			obj.material.shading = THREE.FlatShading;
			obj.material.side = THREE.DoubleSide;
			obj.scale = 10;
		})
		cloud = loadedObj.getObjectByName("Cloud");
		cloud1 = loadedObj.getObjectByName("Cloud.002");
	    var mat = new THREE.MeshPhongMaterial({
			color:0x004eaa,
			transparent:true,
			opacity:0.8,
			shading:THREE.FlatShading
			// side: THREE.DoubleSide
		});

		//Sea
		var seageom = new THREE.PlaneGeometry(250, 250, 40, 40);
		// get the vertices
		var l = seageom.vertices.length;
		var waves = [];
		for (var i=0; i<l; i++){
			// get each vertex
			var v = seageom.vertices[i];
			//store some data associated to it
			waves.push({y:v.y,
						 x:v.x,
						 z:v.z,
						 // a random angle
						 ang:Math.random()*Math.PI*2,
						 // a random distance
						 amp:Math.random()*0.5,
						 // a random speed between 0.016 and 0.048 radians / frame
						 speed:0.016 + Math.random()*0.032
						});
		};

		seaPlane = new THREE.Mesh(seageom, mat);
		seaPlane.rotation.x = -90 * Math.PI/180;
		seaPlane.position.y = 1;

		for (var i=0; i<l; i++) {
			var v = seageom.vertices[i];
			var vprops = waves[i];
			v.y = vprops.y + Math.cos(vprops.ang)*vprops.amp;
			v.z = vprops.z + Math.sin(vprops.ang)*vprops.amp;

			// increment the angle for the next frame
			// vprops.ang += vprops.speed;
		}	

		// Reference Cube
	 	// var cube = new THREE.Mesh( new THREE.CubeGeometry( 2, 2, 2 ), mat);
		// cube.position.x = -15;
		// cube.position.y = 20;
		// cube.position.z = 30;

	    scene.add(seaPlane);
	    scene.add(loadedObj);
	    
	    animate();
	});
}

function createBird(){
  var birdnum = 1;
  for (var i =0; i<birdnum; i++) {
  		bird = new Bird();
		bird.mesh.scale.set(.1,.2,.1);
		bird.mesh.position.y = 15;
		bird.mesh.rotation.y = 90*Math.PI/180;
		group.add(bird.mesh);
  }
	
  scene.add(group);
}

Bird = function() {
	this.mesh = new THREE.Object3D();
    var geomBird = new THREE.BoxGeometry(8,0.2,6,1,1,1);
    geomBird.vertices[0].z -= 4;
    geomBird.vertices[0].x -= 2;
    geomBird.vertices[2].z -= 4;
    geomBird.vertices[2].x -= 2;
    var matBird = new THREE.MeshPhongMaterial({color:0x000000, shading:THREE.FlatShading});
    geomBird.translate(4, 0, 0);
	this.wing = new THREE.Mesh(geomBird, matBird);
	this.wing2 = new THREE.Mesh(geomBird, matBird);
	this.wing2.rotation.z = Math.PI;
	this.mesh.add(this.wing);
	this.mesh.add(this.wing2);
}
function fixNormal(Vector) {
	var t = vector.y;
    vector.y = -vector.z;
    vector.z = t;
}

window.addEventListener('load', init, false);
