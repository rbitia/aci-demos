/**
 * a script for loading bar chart scene for WebGL - @author Yane Frenski
 */

// *** GLOBAL VARIABLES *******************************************************
// ****************************************************************************

// Main scene vars
var camera, scene, renderer, projector, spotLight;
var mouse = { }, touch = { },  INTERSECTED, intersectedId;
var camPos = { x:100, y:100, z:1800 };
var browserRender;

// The deviation position of the ground from the center
var yDeviation, zDeviation, xDeviation;

// Creates the value scale variables
var niceScale;

// bars array
var bars, intersobj;

// scale texts arrays
var sTextVals, sTextRows, sTextCols;


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
  
  // Inits deviation position of the ground from the center
  yDeviation = -(valHeight/2);
  zDeviation = -(schema.cols.length*squareStep/2);
  xDeviation = -(schema.rows.length*squareStep/2);

  // Inits the value scale variables
  niceScale = new NiceScale ( getMinArr ( dataValues ), 
                              getMaxArr ( dataValues ) );
  niceScale.calculate ();
  
  // bars array
  bars = [];
  intersobj = [];

  // scale texts arrays
  sTextVals = [];
  sTextRows = [];
  sTextCols = [];
  
  // changes background colour
  $('body').css('background-color', '#'+backColor);
  
  // removes previous canvas if exists
  $('canvas').remove();
  
  // Getting the projector for picking objects
  projector = new THREE.Projector();
  
  // Creating new scene
  scene = new THREE.Scene();
  
  // Setting the camera
  camera = new THREE.PerspectiveCamera( 60,
                                        window.innerWidth/window.innerHeight,
                                        1,
                                        5000 );
  camera.position.set(camPos.x,camPos.y,camPos.z);
  
  // Extending the BarCube class with longitude and latitude of the bars
  BarCube.prototype.dummyLng = null;
  BarCube.prototype.dummyLat = null;
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
  
  //*** Adding the supernove background *****
  // ****************************************
  
  // Create particle for glow
  var particles = new THREE.Geometry();
  particles.vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0, 0)));
  gpMaterial = new THREE.ParticleBasicMaterial({
          color: 0xFFFFFF,
          size: 3800,
          map: THREE.ImageUtils.loadTexture(
              staticUrl+"img/world_glow.png"
          ),
          blending: THREE.AdditiveBlending,
      });
  var particleGlow = new THREE.ParticleSystem(particles,
                                              gpMaterial);
  particleGlow.sortParticles = true;
  scene.add(particleGlow);
  
  
  //*** Adding the globe ********
  //******************************
  
  // setting up the defuse map
  var matDif = THREE.ImageUtils.loadTexture( staticUrl+"img/world_diffuse.jpg");
  
  // setting up the bump map
  var mapBump = THREE.ImageUtils.loadTexture( staticUrl+"img/world_bump.jpg" );
  mapBump.anisotropy = 1;
  mapBump.repeat.set( 1, 1 );
  mapBump.offset.set( 0, 0 )
  mapBump.wrapS = mapBump.wrapT = THREE.RepeatWrapping;
  mapBump.format = THREE.RGBFormat;
  
  // setting up the material
  var sphereMaterial = new THREE.MeshPhongMaterial({
    ambient : 0x444444,
    color : 0x777777,
    shininess : 40, 
    specular : 0x222222,
    shading : THREE.SmoothShading,
    side: THREE.DoubleSide,
    map:matDif,
    bumpMap:mapBump,
    bumpScale: 10
  });
  // creaing the mesh
  var globe = new THREE.Mesh(new THREE.SphereGeometry( globeRadius,
                                                        32,
                                                        32),
                              sphereMaterial);
  globe.receiveShadow = true;
  // add the globe to the scene
  scene.add(globe); 
  
  //*** Creating the bars and attaching them to the globe ********
  //**************************************************************
  for ( var i=0; i<schema.cols.length; i++ ) {
    if( dataValues[i][0] > 0 ) {
      // crating the bar object
      bars.push( new BarCube( schema.cols[i].color, 0, i,
                          dataValues[i][0], valTextColor,
                          'full', $('#valuelabel'),
                          { row:schema.rows[0].name,
                            col:schema.cols[i].name },
                            niceScale.niceMin,
                            niceScale.range,
                            valHeight ) );
      // removeing the 3d label
      bars[bars.length-1].hasLabel = false;
      // making the widht of the bar smaller
      bars[bars.length-1].sqsize = 10;
      // getting the country from the country list
      var c = country[schema.cols[i].name];
      // add dummy object along wich we can rotate the bar for the longitute
      bars[bars.length-1].dummyLng = new THREE.Mesh( 
        new THREE.PlaneGeometry( 1, 1, 0, 0 ),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
      globe.add(bars[bars.length-1].dummyLng);
      // add dummy object along wich we can rotate the bar for the latitude
      bars[bars.length-1].dummyLat = new THREE.Mesh( 
        new THREE.PlaneGeometry( 1, 1, 0, 0 ),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
      bars[bars.length-1].dummyLng.add(bars[bars.length-1].dummyLat);
      // adding the bar to the scene and positioning it to the earth surface
      bars[bars.length-1].addBar(bars[bars.length-1].dummyLat);
      bars[bars.length-1].reposition(0,globeRadius+bars[bars.length-1].h/2,0);
      // rotating the dummy object so that it snaps to the correct country
      bars[bars.length-1].dummyLng.rotation.y = Math.PI + (c.lng).toRad();
      bars[bars.length-1].dummyLat.rotation.x = Math.PI/2 - (c.lat).toRad();
      // adding the bar to the intersection objects
      intersobj[bars.length-1] = bars[bars.length-1].barobj;
      intersobj[bars.length-1].barid = bars.length-1;
    }
  }
  
  // focus the globe on a certain country
  var cfoc = country[countryFocus];
  globe.rotation.set(cfoc.lat.toRad(), Math.PI - cfoc.lng.toRad(), 0);
  
  //*** Adding the lights
  var light = new THREE.DirectionalLight( 0x999999 );
  light.position.set( -1, 0, 1 ).normalize();
  scene.add( light );
  
  var light = new THREE.DirectionalLight( 0x999999 );
  light.position.set( 0, 1, -1 ).normalize();
  scene.add( light );
  
  var light = new THREE.DirectionalLight( 0x999999 );
  light.position.set( 1, 0, -1 ).normalize();
  scene.add( light );
  
  spotLight = new THREE.SpotLight( 0xFFFFFF, 2 );
  spotLight.position.set( camPos.x, camPos.y, camPos.z );
  spotLight.target.position.set( 0, 0, 0 );
  
  spotLight.shadowCameraNear = 1;
  spotLight.shadowCameraFar = 3000;
  spotLight.shadowCameraFov = 100;
  spotLight.castShadow = true;
  spotLight.shadowDarkness = 0.4;
  spotLight.shadowBias = 0.001;
  // spotLight.shadowCameraVisible  = true;
  scene.add( spotLight );
  ////////////////////
  
}


// *** SCENE INITIALIZATION FOR CANVAS RENDERER *******************************
// ****************************************************************************

function initCanvasScene () {
  // Setting the Canavas renderer
  renderer = new THREE.CanvasRenderer( );
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  $('body').append( renderer.domElement );
  
  //*** Adding the grounds
  
  
  var mapText = THREE.ImageUtils.loadTexture(staticUrl+"img/world_mapplain2.jpg");
  
  var material = new THREE.MeshBasicMaterial( { map: mapText, overdraw: true } );
  
  // MAP SOLUTION
  
  // var geometry = new THREE.PlaneGeometry( 3000, 1500, 6, 3 );                      
  // var globe = new THREE.Mesh( geometry, material );
  // scene.add( globe );
  // globe.rotation.x = -Math.PI/2;
  
  // for ( var i=0; i<schema.cols.length; i++ ) {
  //   if( dataValues[i][0] > 0 ) {
  //     // crating the bar object
  //     bars.push( new BarCube( schema.cols[i].color, 0, i,
  //                         dataValues[i][0], valTextColor,
  //                         'light', $('#valuelabel'),
  //                         { row:schema.rows[0].name,
  //                           col:schema.cols[i].name },
  //                           niceScale.niceMin,
  //                           niceScale.range,
  //                           valHeight ) );
  //     // removeing the 3d label
  //     bars[bars.length-1].hasLabel = false;
  //     // making the widht of the bar smaller
  //     bars[bars.length-1].sqsize = 10;
  //     // getting the country from the country list
  //     var c = country[schema.cols[i].name];
  //     // adding the bar to the scene and positioning it to the earth surface
  //     bars[bars.length-1].addBar(globe);
  //     bars[bars.length-1].reposition(i*10,0,bars[bars.length-1].h/2);
  //     bars[bars.length-1].reorientation(Math.PI/2,0,0);
  //     // rotating the dummy object so that it snaps to the correct country
  //     // adding the bar to the intersection objects
  //     intersobj[bars.length-1] = bars[bars.length-1].barobj;
  //     intersobj[bars.length-1].barid = bars.length-1;
  //   }
  // }
  
  
  // GLOBE SOLUTION
  var globe = new THREE.Mesh(new THREE.SphereGeometry( globeRadius,
                                                        16,
                                                        16),
                              material);
  scene.add( globe );
  
  
  for ( var i=0; i<schema.cols.length; i++ ) {
    if( dataValues[i][0] > 0 ) {
      // crating the bar object
      bars.push( new BarCube( schema.cols[i].color, 0, i,
                          dataValues[i][0], valTextColor,
                          'light', $('#valuelabel'),
                          { row:schema.rows[0].name,
                            col:schema.cols[i].name },
                            niceScale.niceMin,
                            niceScale.range,
                            valHeight ) );
      // removeing the 3d label
      bars[bars.length-1].hasLabel = false;
      // making the widht of the bar smaller
      bars[bars.length-1].sqsize = 10;
      // getting the country from the country list
      var c = country[schema.cols[i].name];
      // add dummy object along wich we can rotate the bar for the longitute
      bars[bars.length-1].dummyLng = new THREE.Mesh( 
        new THREE.PlaneGeometry( 1, 1, 0, 0 ),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
      globe.add(bars[bars.length-1].dummyLng);
      // add dummy object along wich we can rotate the bar for the latitude
      bars[bars.length-1].dummyLat = new THREE.Mesh( 
        new THREE.PlaneGeometry( 1, 1, 0, 0 ),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
      bars[bars.length-1].dummyLng.add(bars[bars.length-1].dummyLat);
      // adding the bar to the scene and positioning it to the earth surface
      bars[bars.length-1].addBar(bars[bars.length-1].dummyLat);
      bars[bars.length-1].reposition(0,globeRadius+bars[bars.length-1].h/2,0);
      // rotating the dummy object so that it snaps to the correct country
      bars[bars.length-1].dummyLng.rotation.y = Math.PI + (c.lng).toRad();
      bars[bars.length-1].dummyLat.rotation.x = Math.PI/2 - (c.lat).toRad();
      // adding the bar to the intersection objects
      intersobj[bars.length-1] = bars[bars.length-1].barobj;
      intersobj[bars.length-1].barid = bars.length-1;
    }
  }
  
  var cfoc = country[countryFocus];
  globe.rotation.set(cfoc.lat.toRad(), Math.PI - cfoc.lng.toRad(), 0);
  
  //*** Adding the lights ********
  //******************************
  var ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
  directionalLight.position.x = 0.4;
  directionalLight.position.y = 0.4;
  directionalLight.position.z = - 0.2;
  directionalLight.position.normalize();
  scene.add( directionalLight );

  var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
  directionalLight.position.x = - 0.2;
  directionalLight.position.y = 0.5;
  directionalLight.position.z = - 0.1;
  directionalLight.position.normalize();
  scene.add( directionalLight );
  //******************************
  
}


// *** SCENE INITIALIZATION ***************************************************
// ****************************************************************************

function initScene() {
  
  // Detecting the renderer:
  browserRender = detectRenderer ( );
  
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
  
  controls = mouseControls ( camera , 1200, 2800 );

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
        bars[intersectedId].hideLabel();
      }
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 
              parseInt( bars[intersects[0].object.barid].darklumcolor, 16 ) );
      bars[intersects[0].object.barid].showLabel( actCoord.x, actCoord.y );
      intersectedId = intersects[0].object.barid;
    }
  } else {
    if ( INTERSECTED ) {
      INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      bars[intersectedId].hideLabel();
    }
    intersectedId = null;
    INTERSECTED = null;
  }
  
  if ( browserRender=='webgl' ) {
    // set the spotlight to move with the camera
    spotLight.position.set( camera.position.x, 
                            camera.position.y-200, 
                            camera.position.z+200);
  }

  // renders                        
  renderer.render( scene, camera );

}

// Converts numeric degrees to radians
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}