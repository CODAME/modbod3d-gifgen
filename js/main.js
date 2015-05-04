//gif.js and gif.js.map need to be in the /js/vender folder
//gif.worker.js and gif.worker.js.map need to be in the / (root) folder

var scene;
var renderer;
var camera;
var sphere;
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

var writeFramesToGif = false;

function setScene(){
	turn_counter = 0;

	// set the scene size
	var WIDTH = 400,
		HEIGHT = 400;

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
	camera.position.z = 24000;
	camera.position.y = 12000;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	$container.append(renderer.domElement);


////////// sprite inits


	var widthOrtho = 400;
	var heightOrtho = 400;

	cameraOrtho = new THREE.OrthographicCamera( - widthOrtho / 2, widthOrtho / 2, heightOrtho / 2, - heightOrtho / 2, 1, 10 );

	cameraOrtho.position.z = 10;

	sceneOrtho = new THREE.Scene();


	mapA = THREE.ImageUtils.loadTexture( "logo/CODAME_C_Jagged_01-white-with-gray-cray.png", undefined, loadSprite);
	
}

function loadSprite( texture )
{

	var material = new THREE.SpriteMaterial( { map : texture } );

	var widthSprite = material.map.image.width;
	var heightSprite = material.map.image.height;	

	spriteBL = new THREE.Sprite( material );
	spriteBL.scale.set( 2 * widthSprite / 3, 2 * heightSprite / 3, 1 );



	var halfWidthSprite = widthSprite / 2;
	var halfHeightSprite = heightSprite / 2;

	var halfScreenWidth = 200;
	var halfScreenHeight = 200;

	spriteBL.position.set( - halfScreenWidth + halfWidthSprite,
			       - halfScreenHeight + halfWidthSprite, 1 ); // bottom left

//	spriteBL.position.set( 0, 0, 1 ); // center


	sceneOrtho.add(spriteBL);
}

function makeSphere(){
	// set up the sphere vars
	var radius = 5,
	    segments = 16,
	    rings = 16;

	var sphereMaterial = new THREE.MeshNormalMaterial();

	// create a new mesh with
	// sphere geometry - we will cover
	// the sphereMaterial next!
	sphere = new THREE.Mesh(

	  new THREE.SphereGeometry(
	    radius,
	    segments,
	    rings),

	  sphereMaterial);

	// add the sphere to the scene
	scene.add(sphere);	

}

function setControls(){
	//var radius = sphere.geometry.boundingSphere.radius;
	controls = new THREE.OrbitControls( camera );
	controls.target = new THREE.Vector3( 0, 0, 0 );
	//controls.noPan = true;
	//controls.noRotate = true;
	controls.update();
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
		
		mesh.rotation.z = turn_counter * (Math.PI / 30);

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

function loadModel(){
	
	var loader = new THREE.STLLoader();

	loader.addEventListener( 'load', function ( event ) {
		var material = new THREE.MeshNormalMaterial();
		var geometry = event.content;
		//modifying the center point
		//geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
		mesh = new THREE.Mesh( geometry, material );


		mesh.position.set( 0, -5750, 0);
		//if a model is loaded sideways, get it upright
		mesh.rotation.set( - Math.PI / 2, 0,  0);
		mesh.scale.set( 130, 130, 130 );

		scene.add( mesh );

	} );
	loader.load( 'stl/tiare_red.stl' );
}

function makeGif(){
	gif = new GIF({ workers: 2, quality: 4 });
	turn_counter = 0;
	writeFramesToGif = true;
}

function animate(){
//	requestAnimationFrame( animate, renderer.domElement );
	requestAnimationFrame( animate );
	render();
}

$( document ).ready(function() {
	// init
	setScene();

	// draw
	//makeSphere();
	loadModel();
	animate();

	// interaction
	setControls();

	document.getElementById("generate-button").addEventListener("click", function(){
	    makeGif();
	});	
});
