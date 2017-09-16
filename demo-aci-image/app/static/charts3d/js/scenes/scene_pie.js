/**
 * a script for loading pie chart scene for WebGL - @author Yane Frenski
 */

// *** GLOBAL VARIABLES *******************************************************
// ****************************************************************************

// Main scene vars
var camera, scene, renderer, projector;
var mouse = { }, touch = { },  INTERSECTED, intersectedId;

// pies array
var pies, intersobj;

// data vars
var totalVal, curAngle;


// *** VARIABLES INITIALIZATION ***********************************************
// ****************************************************************************

function initSceneVars(){
  
  // mouse/touch position
  //-3000 to make ot out of the screen
  mouse.x = -3000;
  mouse.y = -3000;
  touch.x = -3000;
  touch.y = -3000;
  touch.device = false;
  INTERSECTED = null;
  intersectedId = null;
  
  // pies array
  pies = [];
  intersobj = [];
  
  // data vars
  // Calclulating total value of all fields
  totalVal = getTotalArr ( dataValues ); 
  // Setting the current angle of rotation
  curAngle = 0;
  
  // changes background colour
  $('body').css('background-color', '#'+backColor);
  
  // removes previous canvas if exists
  $('canvas').remove();
  
  // Getting the projector for picking objects
  projector = new THREE.Projector();
  
  // Creating new scene
  scene = new THREE.Scene();
  
  // Setting the camera
  camera = new THREE.PerspectiveCamera( 70, 
                                        window.innerWidth/window.innerHeight,
                                        1, 
                                        5000 );
  camera.position.z = 1200;
  camera.position.x = 500;
  camera.position.y = 700;
  
}


// *** SCENE INITIALIZATION FOR WEBGL RENDERER ********************************
// ****************************************************************************

function initWebGLScene () {
  
  // Setting the renderer (with shadows)
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  // Switch off the shadows for safari due to the three.js bug with it
  if( !$.browser.safari && $.browser.version != "534.57.2"){
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
  }
  
  $('body').append( renderer.domElement );

  //*** Adding pies
  for ( var i=0; i<schema.cols.length; i++ ) {
    if( dataValues[i][0] > 0 ){
      pies.push( new PiePart( dataValues[i][0], totalVal, pieRadius, 
                              curAngle, {x:0,y:0,z:0}, extrudeOpts, 
                              schema.cols[i].color, valTextColor, "full", null,
                              { col: schema.cols[i].name } ) );
      curAngle = pies[pies.length-1].addPie(scene);
      // Adds the pies objects to ones that need to be checked for intersection
      // This is used for the moseover action
      intersobj[pies.length-1] = pies[pies.length-1].pieobj;
      intersobj[pies.length-1].pieid = pies.length-1;
    }
  }
  
  //////////////////
  
  //*** Adding the lights
  var light = new THREE.DirectionalLight( 0x777777 );
  light.position.set( 1, -1, 1 ).normalize();
  scene.add( light );
  
  var light = new THREE.DirectionalLight( 0x777777 );
  light.position.set( -1, 1, -1 ).normalize();
  scene.add( light );
  
  light = new THREE.SpotLight( 0xffffff, 1 );
  light.position.set( 600, 3000, 1500 );
  light.target.position.set( 0, 0, 0 );
  
  light.shadowCameraNear = 1000;
  light.shadowCameraFar = 5000;
  light.shadowCameraFov = 40;
  light.castShadow = true;
  light.shadowDarkness = 0.3;
  light.shadowBias = 0.0001;
  // light.shadowCameraVisible  = true;
  scene.add( light );
  ////////////////////

}


// *** SCENE INITIALIZATION FOR CANVAS RENDERER *******************************
// ****************************************************************************

function initCanvasScene () {
  
  // Setting the canvas renderer
  renderer = new THREE.CanvasRenderer( );
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  $('body').append( renderer.domElement );

  //*** Adding pies
  for ( var i=0; i<schema.cols.length; i++ ) {
    if( dataValues[i][0] > 0 ){
      pies.push( new PiePart( dataValues[i][0], totalVal, pieRadius, 
                              curAngle, {x:0,y:0,z:0}, extrudeOpts, 
                              schema.cols[i].color, valTextColor, 
                              'light', $('#valuelabel'),
                              { col: schema.cols[i].name } ) );
      pies[pies.length-1].hasLabel = false;
      curAngle = pies[pies.length-1].addPie(scene);
      // Adds the pies objects to ones that need to be checked for intersection
      // This is used for the moseover action
      intersobj[pies.length-1] = pies[pies.length-1].pieobj;
      intersobj[pies.length-1].pieid = pies.length-1;
    }
  }
  
  ////////////////// 
  
  //*** Adding the lights ********
	var ambientLight = new THREE.AmbientLight( 0x777777 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0x777777 );
	directionalLight.position.x = 0.4;
	directionalLight.position.y = 0.4;
	directionalLight.position.z = - 0.2;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	var directionalLight = new THREE.DirectionalLight( 0x777777 );
	directionalLight.position.x = - 0.2;
	directionalLight.position.y = 0.5;
	directionalLight.position.z = - 0.1;
	directionalLight.position.normalize();
	scene.add( directionalLight );
  //******************************
  
}


// *** SCENE INITIALIZATION ***************************************************
// ****************************************************************************

function initScene () {
  
  // Detecting the renderer:
  var browserRender = detectRenderer ( );
  
  // Setting the renderer to null in case an old version of FF or IE
  if(($.browser.msie&&parseFloat($.browser.version)<9)||
     ($.browser.mozilla&&parseFloat($.browser.version)<2)){
    browserRender = null;
  }
  
  // Init vars and scene depending on the renderer
  if ( browserRender == 'webgl' ) {
    initSceneVars ();
    initWebGLScene ();
  }
  else if ( browserRender == 'canvas' ) {
    initSceneVars ();
    initCanvasScene ();
  }
  else {
    nonSupportedBrowsers();
  }
  
  controls = mouseControls ( camera , 500, 3500 );

}


// *** SCENE ANIMATION ********************************************************
// ****************************************************************************

function animateScene() {

  requestAnimationFrame( animateScene );
  
  // Updateing the controls for the trackball camera
  controls.update();
  
  // find intersections - from the Mr.Doob example
  // url: http://mrdoob.github.com/three.js/examples/webgl_interactive_cubes.html
  
  // Checks first if it's touch or mouse device
  if (!touch.device) {
    var actCoord = { x: mouse.x, y: mouse.y };
  }else{
    var actCoord = { x: touch.x, y: touch.y };
  }
  
  var vector = new THREE.Vector3( actCoord.x, actCoord.y, 1 );
  
  projector.unprojectVector( vector, camera );
   
  var ray = new THREE.Ray( camera.position, 
                            vector.subSelf( camera.position ).normalize() );
  var intersects = ray.intersectObjects( intersobj );
  
  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED ) {
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        pies[intersectedId].hideLabel();
      }
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 
              parseInt( pies[intersects[0].object.pieid].darklumcolor, 16 ) );
      pies[intersects[0].object.pieid].showLabel( actCoord.x, actCoord.y );
      intersectedId = intersects[0].object.pieid;
    }
  } else {
    if ( INTERSECTED ) {
      INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      pies[intersectedId].hideLabel();
    }
    intersectedId = null;
    INTERSECTED = null;
  }

  renderer.render( scene, camera );

}