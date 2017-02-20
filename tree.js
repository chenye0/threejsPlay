var scene,
    camera, cameraControls, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

var rotationspeed = 0.002;
var group = new THREE.Group();

var hemisphereLight, shadowLight;

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };
function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	// scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
		
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
	nearPlane = 1;
	farPlane = 100;
	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.x = -3;
	camera.position.z = 8;
	camera.position.y = 5;
	cameraControls.target = new THREE.Vector3(0, 0, 0);

    cameraControls.addEventListener( 'change', render ); // remove when using animation loop

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
}
function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xffffff,0xffffff, .9);
	// hemisphereLight.color.setHSL( 1, 1, 1 );
	// hemisphereLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemisphereLight.position.set( 0, 100, 0 );
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	shadowLight.position.set(0, 10, 20);
	shadowLight.castShadow = true;
	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
	if(group.rotation.y > 1.2 || group.rotation.y < 0) {
		rotationspeed = -1 * rotationspeed;
	}
	group.rotation.y += rotationspeed;
	console.log(rotationspeed);
	// tree.rotation.y += .01;
    window.requestAnimationFrame(animate);
    cameraControls.update();
    render();
}

function init() {
    createScene();
    createLights();
	var loader = new THREE.ObjectLoader();
	loader.load('./lowpolytree.json', function(loadedObj, materials) {
	    var tree = loadedObj.getObjectByName("Tree");
	    var mat = new THREE.MeshPhongMaterial({
			color:0x68c3c0,
			transparent:true,
			opacity:.6,
			shading:THREE.FlatShading,
		});
	    // treemesh = new THREE.Mesh(tree, mat);
	    // treemesh.translation = THREE.GeometryUtils.center(loadedObj);
	    var leaf1 = loadedObj.getObjectByName("Leaf1");
	    var leaf2 = loadedObj.getObjectByName("Leaf2");
	    var earth = loadedObj.getObjectByName("Earth");
	    // mesh.position.y = -100;
	    group.add(tree);
	    group.add(leaf1);
	    group.add(leaf2);
	    group.add(earth);
	    scene.add(group);
	    animate();
	});

}

window.addEventListener('load', init, false);
