/**
 * @author E Chauvin
 */


THREE.TrackballControlsTouch = function ( object, domElement ) {
  
  var _this = this,
  STATE = { NONE : -1, ROTATE : 0, ZOOM : 1, PAN : 2 };

  this.object = object;
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  // API

  this.enabled = true;

  this.rotateSpeed = 1.0;
  this.zoomSpeed = 0.8;
  this.panSpeed = 0.3;

  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;

  this.staticMoving = false;
  this.dynamicDampingFactor = 0.2;

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

  this.ismine = true;

  // internals

  this.target = new THREE.Vector3( 0, 0, 0 );

  var _keyPressed = false,
  _state = STATE.NONE,

  _eye = new THREE.Vector3(),

  _rotateStart = new THREE.Vector3(),
  _rotateEnd = new THREE.Vector3(),

  _zoomStart = new THREE.Vector2(),
  _zoomEnd = new THREE.Vector2(),

  _panStart = new THREE.Vector2(),
  _panEnd = new THREE.Vector2();

  // Ajout E.Chauvin 11 Septembre 2012
  var _2fingers = false; // pour savoir si API Touch pour zoom
  var _v2fStart = [];
  var _v2fEnd = [];
  var _scale_treshold = 0.01;
  var _start_distance;
  var _start_rotation;

  // location on screen

  var _virginity = true;

  this.relocate = function(event) {
      var elem = _this.domElement;
      var tdeLeftOffset = elem.offsetLeft; 
      var tdeTopOffset  = elem.offsetTop;
      while (elem = elem.offsetParent)
      {
          tdeLeftOffset += elem.offsetLeft;
          tdeTopOffset  += elem.offsetTop;
      }
      _this.screen = {
              width: _this.domElement.clientWidth, 
              height: _this.domElement.clientHeight,
              offsetLeft: tdeLeftOffset - window.pageXOffset, 
              offsetTop: tdeTopOffset - window.pageYOffset};
  }

  this.first_relocate = function(event) {
      _virginity = false;
      this.relocate();
      _this.radius = (_this.screen.width + _this.screen.height ) / 4;
  }

  // methods

  this.handleEvent = function ( event ) {

      if ( typeof this[ event.type ] == 'function' ) {

          this[ event.type ]( event );

      }

  };

  this.getMouseOnScreen = function( clientX, clientY ) {

      return new THREE.Vector2(
          ( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
          ( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
      );

  };

  this.getMouseProjectionOnBall = function( clientX, clientY ) {

      var mouseOnBall = new THREE.Vector3(
          ( clientX - _this.screen.width * 0.5 - _this.screen.offsetLeft ) / _this.radius,
          ( _this.screen.height * 0.5 + _this.screen.offsetTop - clientY ) / _this.radius,
          0.0
      );

      var length = mouseOnBall.length();

      if ( length > 1.0 ) 
      {
          mouseOnBall.normalize();
      } 
      else 
      {
          mouseOnBall.z = Math.sqrt( 1.0 - length * length );
      }

      _eye.copy( _this.object.position ).subSelf( _this.target );

      var projection = _this.object.up.clone().setLength( mouseOnBall.y );
      projection.addSelf( _this.object.up.clone().crossSelf( _eye ).setLength( mouseOnBall.x ) );
      projection.addSelf( _eye.setLength( mouseOnBall.z ) );

      return projection;

  };

  this.rotateCamera = function() {

      var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

      if ( angle ) 
      {
          var axis = ( new THREE.Vector3() ).cross( _rotateStart, _rotateEnd ).normalize(),
              quaternion = new THREE.Quaternion();

          angle *= _this.rotateSpeed;

          quaternion.setFromAxisAngle( axis, -angle );

          quaternion.multiplyVector3( _eye );
          quaternion.multiplyVector3( _this.object.up );

          quaternion.multiplyVector3( _rotateEnd );

          if ( _this.staticMoving ) {

              _rotateStart = _rotateEnd;

          } else {
              quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
              quaternion.multiplyVector3( _rotateStart );
          }
      }
  };

  this.zoomCamera = function()
  {
      var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

      if ( factor !== 1.0 && factor > 0.0 ) 
      {
          _eye.multiplyScalar( factor );

          if ( _this.staticMoving ) 
          {
              _zoomStart = _zoomEnd;
          } 
          else 
          {
              _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
          }
      }
  };
  /**
   * E.Chauvin 11 Septembre 2012 - Pinch to Zoom
   */
  this.pinchToZoomCamera = function() 
  {
      if (_start_distance == 0)
          return;

      var end_distance = _v2fEnd[0].distanceTo(_v2fEnd[1]);

      var scale = end_distance / _start_distance;

      var delta = (1-scale);
      if (Math.abs(delta) < _scale_treshold)
          return;

      var factor = 1 + delta * _this.zoomSpeed/2;
      if ( factor !== 1.0 && factor > 0.0 && factor < 1.5) 
      {
          _eye.multiplyScalar(factor);
          _start_distance += ( end_distance - _start_distance ) * this.dynamicDampingFactor;
      }

      // Traitement de la rotation
      var x = _v2fEnd[0].x - _v2fEnd[1].x;
      var y = _v2fEnd[0].y - _v2fEnd[1].y;
      var end_rotation = Math.atan2(y, x) / Math.PI;
      var angle = end_rotation - _start_rotation;
      _rotateStart = _rotateEnd = null;
      if ( angle ) 
      {
          var axis = new THREE.Vector3(0,0,1).normalize();
          var quaternion = new THREE.Quaternion();

          angle *= _this.rotateSpeed*2.5;

          quaternion.setFromAxisAngle( axis, angle );

          quaternion.multiplyVector3( _this.object.up );

          _start_rotation = end_rotation;
      }
  };

  this.panCamera = function() {

      var mouseChange = _panEnd.clone().subSelf( _panStart );

      if ( mouseChange.lengthSq() ) {

          mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

          var pan = _eye.clone().crossSelf( _this.object.up ).setLength( mouseChange.x );
          pan.addSelf( _this.object.up.clone().setLength( mouseChange.y ) );

          _this.object.position.addSelf( pan );
          _this.target.addSelf( pan );

          if ( _this.staticMoving ) {

              _panStart = _panEnd;

          } else {

              _panStart.addSelf( mouseChange.sub( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

          }

      }

  };

  this.checkDistances = function() 
  {

      if ( !_this.noZoom || !_this.noPan ) {

          if ( _this.object.position.lengthSq() > _this.maxDistance * _this.maxDistance ) {

              _this.object.position.setLength( _this.maxDistance );

          }

          if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

              _this.object.position.add( _this.target, _eye.setLength( _this.minDistance ) );

          }

      }

  };

  this.update = function() 
  {
      _eye.copy( _this.object.position ).subSelf( this.target );

      if ( !_this.noRotate ) 
      {
          if (!_2fingers)
              _this.rotateCamera();
      }

      if ( !_this.noZoom ) 
      {
          if (!_2fingers)
              _this.zoomCamera();
          else
              _this.pinchToZoomCamera();
      }

      if ( !_this.noPan ) 
      {
          _this.panCamera();
      }

      _this.object.position.add( _this.target, _eye );

      _this.checkDistances();

      _this.object.lookAt( _this.target );
  };


  // listeners
  function keydown( event ) 
  {
      if ( ! _this.enabled ) return;

      if ( _state !== STATE.NONE ) {

          return;

      } else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

          _state = STATE.ROTATE;

      } else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

          _state = STATE.ZOOM;

      } else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

          _state = STATE.PAN;

      }

      if ( _state !== STATE.NONE ) {

          _keyPressed = true;

      }

  };

  function keyup( event ) 
  {
      if ( ! _this.enabled ) return;

      if ( _state !== STATE.NONE ) {

          _state = STATE.NONE;

      }

  };

  function mousedown( event ) 
  {
      if(_virginity) _this.first_relocate();

      if ( ! _this.enabled ) return;

      event.preventDefault();
      event.stopPropagation();

      if ( _state === STATE.NONE ) {

          _state = event.button;

          if ( _state === STATE.ROTATE && !_this.noRotate ) {

              _rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

          } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

              _zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

          } else if ( !this.noPan ) {

              _panStart = _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

          }

      }
  };
  /**
   * Quand la souris bouge
   * @param event
   */
  function mousemove( event ) 
  {
      if ( ! _this.enabled ) return;

      if ( _keyPressed ) 
      {
          _rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );
          _zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
          _panStart = _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

          _keyPressed = false;

      }

      if ( _state === STATE.NONE ) {

          return;

      } 
      else if ( _state === STATE.ROTATE && !_this.noRotate ) 
      {
          _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

      } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

          _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

      } else if ( _state === STATE.PAN && !_this.noPan ) {

          _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

      }

  };
  /*
   * Quand le click de la souris est leve
   */
  function mouseup( event ) 
  {
      if ( ! _this.enabled ) return;

      event.preventDefault();
      event.stopPropagation();
      _state = STATE.NONE;
  };

  // ---------------------------------------
  // Fonction pour gérer le multi touch
  // E.Chauvin : 11 Septembre 2012
  // ---------------------------------------
  /**
   * Equivalent à mousedown
   */
  function touchstart ( event ) 
  {
    
     // added by Yane
     touch.x = ( event.touches[0].pageX / window.innerWidth ) * 2 - 1;
     touch.y = - ( event.touches[0].pageY / window.innerHeight ) * 2 + 1;
     touch.device = true;
     
      // Detection d'un deuxieme doigt
      if (event.touches.length > 1)
      {
          _2fingers = true;
          _state = STATE.ZOOM;
      }
      else
      { 
          _2fingers = false;
          _state = STATE.ROTATE;
      }

      if(_virginity) _this.first_relocate();

      if ( ! _this.enabled ) return;

      event.preventDefault();
      event.stopPropagation();

      if ( _state === STATE.ROTATE && !_this.noRotate ) 
      {
          _rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[0].pageX, event.touches[0].pageY );
      } 
      else if ( _state === STATE.ZOOM && !_this.noZoom ) 
      {
          _rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[0].pageX, event.touches[0].pageY );

          _v2fStart[0] = _this.getMouseOnScreen( event.touches[0].pageX, event.touches[0].pageY );
          _v2fStart[1] = _this.getMouseOnScreen( event.touches[1].pageX, event.touches[1].pageY );
          _start_distance = _v2fStart[0].distanceTo(_v2fStart[1]);

          var x = _v2fStart[0].x - _v2fStart[1].x;
          var y = _v2fStart[0].y - _v2fStart[1].y;
          _start_rotation = Math.atan2(y, x) / Math.PI;
          _v2fEnd = _v2fStart;
      }
      
  };
  /**
   * Equivalent à mousemove
   * @param event
   */
  function touchmove (event)
  {
      if ( ! _this.enabled ) return;

      if ( _state === STATE.NONE ) 
      {
          return;
      }
      else if ( _state === STATE.ROTATE && !_this.noRotate ) 
      {
          _rotateEnd = _this.getMouseProjectionOnBall( event.touches[0].pageX, event.touches[0].pageY );
      } 
      else if ( _state === STATE.ZOOM && !_this.noZoom ) 
      {
          _rotateEnd = _this.getMouseProjectionOnBall( event.touches[0].pageX, event.touches[0].pageY );
          _v2fEnd[0] = _this.getMouseOnScreen( event.touches[0].pageX, event.touches[0].pageY );
          _v2fEnd[1] = _this.getMouseOnScreen( event.touches[1].pageX, event.touches[1].pageY );
      }
  };

  /**
   * Idem mouseup
   * @param event
   */
  function touchend(event)
  {
      _2fingers = false;
      _start_distance = 0;
      mouseup( event );
  };

  /*
   * Description prototype des fonctions
   */
  this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

  this.domElement.addEventListener( 'mousemove', mousemove, false );
  this.domElement.addEventListener( 'mousedown', mousedown, false );
  this.domElement.addEventListener( 'mouseup', mouseup, false );

  this.domElement.addEventListener ('touchstart', touchstart,false);
  this.domElement.addEventListener ('touchmove', touchmove,false);
  this.domElement.addEventListener ('touchend', touchend,false);

  window.addEventListener( 'keydown', keydown, false );
  window.addEventListener( 'keyup', keyup, false );

  document.addEventListener('scroll', this.relocate, false);
  window.addEventListener('resize', this.relocate, false);
  
}