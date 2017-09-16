// *******************
// Util functions

// A function to Detect touch devices - solution by Gregers Rygg
// maybe look for better one
function isTouchDevice() {
   var el = document.createElement('div');
   el.setAttribute('ongesturestart', 'return;');
   if(typeof el.ongesturestart == "function"){
      return true;
   }else {
      return false
   }
}

// A function to calcuate lighter hex colour for the wireframe 
// courtesy of Craig Buckler:
// http://www.sitepoint.com/javascript-generate-lighter-darker-color/

function colorLuminance(hex, lum) {  
    // validate hex string  
    hex = String(hex).replace(/[^0-9a-f]/gi, '');  
    if (hex.length < 6) {  
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];  
    }
    lum = lum || 0;  
    // convert to decimal and change luminosity  
    var rgb = "", c, i;  
    for (i = 0; i < 3; i++) {  
        c = parseInt(hex.substr(i*2,2), 16);  
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);  
        rgb += ("00"+c).substr(c.length);  
    }
    return rgb;  
};


// Function to get the max value in a 2-dimensional array
function getMaxArr(arr){
  var maxVal = arr[0][0];
  for( var i=0; i<arr.length; i++ ){
    for ( var j=0; j<arr[i].length; j++ ){
      if( arr[i][j] > maxVal) maxVal = arr[i][j];
    }
  }
  return maxVal;
}

// Function to get the max value in a 2-dimensional array
function getMinArr(arr){
  var minVal = arr[0][0];
  for( var i=0; i<arr.length; i++ ){
    for ( var j=0; j<arr[i].length; j++ ){
      if( arr[i][j] < minVal) minVal = arr[i][j];
    }
  }
  return minVal;
}

// Gets the closest rounding of the max value
function getRoundMax (val){
  
  var powsign = -1;
  if( val < 1 && val > -1){
    var roundRatio = 1;
  }else{
    var maxLength = val.toString().length;
    var roundRatio = Math.pow( 10, powsign*(maxLength-1) );
  }
  
  if( val > 0){
    return Math.ceil(val*roundRatio)/roundRatio;
  }else{
    return Math.round(val*roundRatio)/roundRatio;
  }
  
}

// function to get total count in two dimentional array
function getTotalArr(arr){
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      if ( typeof arr[i][j] != 'number' ) arr[i][j] = 0;
      total += arr[i][j];
    }
  }
  return total;
}

// funciton to update the legend div - requires jQuery
function initLegend(el, schema){
  el.empty();
  for ( var i=0; i<schema.cols.length; i++){
    el.append('<div style="margin-right:5px; background-color:#'+
                schema.cols[i].color+'" class="div-legend-color left"></div>'+
               '<div class="left" style="margin-right:10px;">'+
                schema.cols[i].name+'</div>');
  }
  el.append ('<div class="clear"></div>');
}

// function to return canvas scale texts
function createTextureScale ( text, h, line, size, color, backGroundColor, align ) {

  var backgroundMargin = 10;
  
  var canvas = document.createElement("canvas");

  var context = canvas.getContext("2d");
  context.font = size + "px Arial";

  var textMaxWidth = context.measureText(text[0].name).width;
  for ( var i=1; i<text.length; i++ ){
    var textWidth = context.measureText(text[i]).width;
    if ( textWidth>textMaxWidth ) textMaxWidth = textWidth;
  }

  canvas.width = textMaxWidth + backgroundMargin;
  canvas.height = h + backgroundMargin;
  context = canvas.getContext("2d");
  
  context.font = size + "px Arial";

  if(backGroundColor) {
    context.beginPath();
    context.rect(0, 0, canvas.width , canvas.height);
    context.fillStyle = backGroundColor;
    context.fill();
  }

  context.textAlign = align;
  context.textBaseline = "middle";
  
  var xpos = backgroundMargin;
  if( align == "right") xpos = textMaxWidth-backgroundMargin;
  
  for ( var i=0; i<text.length; i++ ){
    context.fillStyle = color;
    if ( text[i].color )  context.fillStyle = "#"+text[i].color;
    context.fillText(text[i].name, xpos, i*line+line/2);
  }
  
  return canvas;
  
}

// three.js camera mouse/touch controls

function mouseControls ( camera, minDist, maxDist ){
  
  // **** Mouse controls *********************
  // Setting controls for the trackball camera
  
  if ( isTouchDevice () ){
    controls = new THREE.TrackballControlsTouch( camera, renderer.domElement );
  }else{
    controls = new THREE.TrackballControls( camera, renderer.domElement );
  }
  controls.zoomSpeed = 0.3;
  controls.rotateSpeed = 0.1;
  controls.minDistance = minDist;
  controls.maxDistance = maxDist;
  
  // funciton to get the mouse position for the hover efect onthe pies
  $(document).mousemove(function(event) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  });

  // function to adjust the size of the canvas when resizing the window
  $(window).resize(function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });
  
  return controls;
  
}

function detectRenderer (){
  
  // Detecting the renderer - from webgl detector
  var ifcanvas = !! window.CanvasRenderingContext2D;
  var ifwebgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();
  
  // Init vars and scene depending on the renderer
  if ( ifwebgl ) {
    return 'webgl'
  }
  else if ( ifcanvas ) {
    return 'canvas'
  }
  else {
    return 'none';
  }
}

// Ajax token functions - from Django docs
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function nonSupportedBrowsers () {
  if(replaceImage){
    $('body').append('<img id="non-supported-img" src="'+replaceImage+'" />');
  }else{
    $('body').append('<div id="non-supported-errormsg" />Unfortunately your browser doesn\'t support the threegraphs editor. Please use Chrome, Firefox 4+, Internet Explorer 9+, Safari 5+, or Opera.</div>');
  }
}

