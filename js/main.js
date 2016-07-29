//config
var showLogo = true;
var retinaScreen = true;
var rotateUpright = true;
var transparentBackground = false;
var camZ = 250;

//global
var frameCounter;
var gifjs;

// we're always rotating
// this gets set to true to collect those rotation frames into a gif
var writeFramesToGif = false;

// threejs
var scene;
var renderer;
var camera;
var mesh;
var pivot;
var spriteBL;
var cameraOrtho;
var sceneOrtho;
var loaderListener;

// scene size, determined by retinaScreen flag
var WIDTH;
var HEIGHT;

// dat.gui control panel
var gui;

// var modelToLoad = 'stl/centered.stl';
// declared in PHP at the top of index

function setScene(){
	frameCounter = 0;

	// set the scene size
	WIDTH = 400;
	HEIGHT = 400;
	if(retinaScreen == true){
		WIDTH = 200;
		HEIGHT = 200;
	}

	// set some camera attributes
	var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 40000;

	// get the DOM element to attach to
	// assume we've got jQuery to hand
	var $container = $('#container');

	// create a WebGL renderer
	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
	// allow render overlay on top of sprited sphere
	renderer.autoClear = false;
	// create camera and scene
	camera = new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR
	);
	scene = new THREE.Scene();

	// add the camera to the scene
	scene.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.z = camZ;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	$container.append(renderer.domElement);

	// sprite inits
	var widthOrtho = WIDTH;
	var heightOrtho = HEIGHT;

	cameraOrtho = new THREE.OrthographicCamera( - widthOrtho / 2, widthOrtho / 2, heightOrtho / 2, - heightOrtho / 2, 1, 10 );

	cameraOrtho.position.z = 10;

	sceneOrtho = new THREE.Scene();

	THREE.ImageUtils.loadTexture( "logo/CODAME_C_Jagged_01-pure-white.png", undefined, loadSprite);
}

function loadSprite( texture )
{
	var material = new THREE.SpriteMaterial( { map : texture, opacity: .5} );

	var widthSprite = material.map.image.width;
	var heightSprite = material.map.image.height;

	spriteBL = new THREE.Sprite( material );
	spriteBL.scale.set( widthSprite / 3, heightSprite / 3, 1 );

	var halfWidthSprite = widthSprite / 2;
	var halfHeightSprite = heightSprite / 2;

	var halfScreenWidth = WIDTH/2;
	var halfScreenHeight = HEIGHT/2;

	// bottom right, github
	//spriteBL.position.set( halfScreenWidth - halfWidthSprite +15, - halfScreenHeight + halfWidthSprite -15, 1 );

	// bottom left, codame
	spriteBL.position.set( - halfScreenWidth + halfWidthSprite -35, - halfScreenHeight + halfWidthSprite -35, 1 );

	// center
	//spriteBL.position.set( 0, 0, 1 );

	//remove logo sprite?
	if(showLogo == true){
		sceneOrtho.add(spriteBL);
	}

}

//debugging function
var imgData;
function renderImg() {
        requestAnimationFrame(renderImg);
        renderer.render(scene, camera);
        if(getImageData == true){
            imgData = renderer.domElement.toDataURL();
            getImageData = false;
        }
    }

function render() {
	if(mesh && frameCounter < 60){
		mesh.position.x = window.parameters.rotationX;
		mesh.position.z = window.parameters.rotationZ;

		// 360° / 60 frames = turn 6° each frame
		// π/30 × 180°/π = 6°
		pivot.rotation.y = frameCounter * (Math.PI / 30);

		renderer.clear();
		renderer.render( scene, camera );
		renderer.clearDepth();
		renderer.render( sceneOrtho, cameraOrtho );

		// debugging block
		/*
		getImageData = true;
		renderImg();
		console.debug(imgData);
		console.log(renderer.domElement);
		*/

		if (writeFramesToGif==true) {
			gifjs.addFrame(renderer.domElement, {copy: true, delay: 40});
		};

		frameCounter++;
	}
	else if (frameCounter == 60)
	{
		if (writeFramesToGif==true) {
			// pop a new window with the gif when it's finished rendering
			gifjs.on('finished', function(blob) {
	  			window.open(URL.createObjectURL(blob));
			});
			// compile the frames into a gif
			gifjs.render();
			// go back to just spinning around
			writeFramesToGif = false;
		}

		frameCounter = 0;
	}
}

var loadModel = function(){
	// dispose of the previous model
	if(mesh){
		scene.remove(mesh);
	}

	var loader = new THREE.STLLoader();

	loaderListener = loader.addEventListener( 'load', function ( event ) {
		var material = new THREE.MeshNormalMaterial();
		var geometry = event.content;
		mesh = new THREE.Mesh( geometry, material );

		// if a model is loaded sideways, get it upright
		mesh.rotation.set( 0, 0, 0);

		// use a pivot object so we can modify the rotation point
		// https://github.com/mrdoob/three.js/issues/1364
		pivot = new THREE.Object3D();
		pivot.add( mesh );
		scene.add( pivot );

	} );

	loader.load( modelToLoad );
}

function makeGif(){
	if(transparentBackground){
		gifjs = new GIF({ workers: 2, quality: 4, transparent: 0x000000 });
	}else{
		gifjs = new GIF({ workers: 2, quality: 4});
	}
	frameCounter = 0;
	writeFramesToGif = true;
}

function animate(){
	if(mesh){
		mesh.scale.set( window.parameters.meshScale, window.parameters.meshScale, window.parameters.meshScale );
		mesh.position.set( 0, window.parameters.meshVert, 0);
		camera.position.y = window.parameters.camVert;
		camera.lookAt( scene.position );
	}

	requestAnimationFrame( animate );
	render();
}

function init(){
	var gui = new dat.GUI();
	var parameters =
	{
		meshScale: 111,
		meshVert: 0,
		camVert: -92,
		rotationX: 0,
		rotationZ: 0
	}
	gui.add(parameters,'meshScale').min(40).max(400).name('Mesh Scale');
	gui.add(parameters,'meshVert').min(-300).max(300).name('Mesh Vert');
	gui.add(parameters,'camVert').min(-300).max(300).name('Cam Vert');
	gui.add(parameters,'rotationX').min(-20).max(20).name('Rotation X');
	gui.add(parameters,'rotationZ').min(-20).max(20).name('Rotation Z');

	window.parameters = parameters;

	// init
	setScene();

	// draw
	loadModel();
}

$( document ).ready(function() {
	init();
	animate();

	document.getElementById("generate-button").addEventListener("click", function(){
	    makeGif();
	});
});
