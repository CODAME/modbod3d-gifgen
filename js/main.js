//gif.js and gif.js.map need to be in the /js/vender folder
//gif.worker.js and gif.worker.js.map need to be in the / (root) folder

var scene;
var renderer;
var camera;
var mesh;
var rotationFrame;
var helper;
var turn_counter;
var gif;

var getImgData;
var imgData;

var spriteBL;
var cameraOrtho;
var sceneOrtho;
var mapA

var WIDTH;
var HEIGHT;

var loaderListener;

var gui;

//initial values
var camZ = 250;

var writeFramesToGif = false;

var retinaScreen = true;

// var modelToLoad = 'stl/centered.stl';
// declared in PHP at the top of index

function setScene(){
	turn_counter = 0;

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
	// - assume we've got jQuery to hand
	var $container = $('#container');

	// create a WebGL renderer, camera
	// and a scene

	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
	renderer.autoClear = false; // To allow render overlay on top of sprited sphere


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

	mapA = THREE.ImageUtils.loadTexture( "logo/CODAME_C_Jagged_01-pure-white.png", undefined, loadSprite);
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
	sceneOrtho.add(spriteBL);
}

//debugging function
function renderImg() {
        requestAnimationFrame(renderImg);
        renderer.render(scene, camera);
        if(getImageData == true){
            imgData = renderer.domElement.toDataURL();
            getImageData = false;
        }
    }

function render() {


	if(mesh && turn_counter < 60){

		mesh.rotation.y = turn_counter * (Math.PI / 30);

		renderer.clear();
		renderer.render( scene, camera );
		renderer.clearDepth();
		renderer.render( sceneOrtho, cameraOrtho );

		//debugging block
//		getImageData = true;
//		renderImg();
//		console.debug(imgData);
//		console.log(renderer.domElement);

		if (writeFramesToGif==true) {
			gif.addFrame(renderer.domElement, {copy: true, delay: 40});
		};

		turn_counter++;

	}
	else if (turn_counter == 60)
	{

		if (writeFramesToGif==true) {
			gif.on('finished', function(blob) {
	  			window.open(URL.createObjectURL(blob));
			});

			gif.render();

			//go back to just spinning around
			writeFramesToGif = false;
		}

		turn_counter = 0;
	}


      //renderer.render( scene, camera );
}

var loadModel = function(){

	//dispose of the previous model
	if(mesh){
		scene.remove(mesh);
	}

	var loader = new THREE.STLLoader();

	loaderListener = loader.addEventListener( 'load', function ( event ) {
		var material = new THREE.MeshNormalMaterial();
		var geometry = event.content;
		//modifying the center point
		//geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
		mesh = new THREE.Mesh( geometry, material );

		//if a model is loaded sideways, get it upright
		mesh.rotation.set( 0, 0, 0);

		scene.add( mesh );

	} );

	loader.load( modelToLoad );
}

function makeGif(){
	gif = new GIF({ workers: 2, quality: 4 });
	turn_counter = 0;
	writeFramesToGif = true;
}

function animate(){
//	requestAnimationFrame( animate, renderer.domElement );
	if(mesh){
		mesh.scale.set( window.parameters.meshScale, window.parameters.meshScale, window.parameters.meshScale );
		mesh.position.set( 0, window.parameters.meshVert, 0);
		camera.position.y = window.parameters.camVert;
		camera.lookAt( scene.position );
	}


	requestAnimationFrame( animate );
	render();
}

function renderNewModel(files){
	var f = files[0];
	//TODO STL ONLY
	/*
	if ( !f.type.match('image.*') ) {
		//display error message
		return;
	}
	*/

	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function(theFile) { return function(e) {
		console.log(e.target.result);

		// Render loaded STL.

		//var profileImage = document.getElementById('profile-image');
		//profileImage.innerHTML = ['<img id="loadedPhoto" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
		//$(function(){ $('#loadedPhoto').Jcrop(); });

	};})(f);

	// Read in the image file as a data URL.
	reader.readAsDataURL(f);

}

function renderAttributes(files){
	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {

	output.push('<li><b>', escape(f.name), '</b> (', f.type || 'n/a', ') - ',
	              f.size, ' bytes, last modified: ',
	              f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
	              '</li>');
	}

	// spew it on the screen
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function handleFileInput(evt) {
	var files = evt.target.files; // FileList object
	renderAttributes(files);
	renderNewModel(files);
}

function handleFileDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var files = evt.dataTransfer.files; // FileList object.
	renderAttributes(files);
	renderNewModel(files);
}

function initFileReading(){
	//functionality from http://www.html5rocks.com/en/tutorials/file/dndfiles/
	//read progress bar could be added if necessary but since it's client side loading
	//it's pretty fast and an progress bar would be more interesting/useful when sending image to server

	//read via input select
	document.getElementById('files').addEventListener('change', handleFileInput, false);

	//read via drag and drop
	var dropZone = document.getElementById('drop-zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileDrop, false);
}

function init(){
	var gui = new dat.GUI();
	var parameters =
	{
		meshScale: 200,
		meshVert: 0,
		camVert: 100
	}
	gui.add(parameters,'meshScale').min(40).max(400).name('Mesh Scale');
	gui.add(parameters,'meshVert').min(-300).max(300).name('Mesh Vert');
	gui.add(parameters,'camVert').min(-300).max(300).name('Cam Vert');

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

	//initFileReading();

});
