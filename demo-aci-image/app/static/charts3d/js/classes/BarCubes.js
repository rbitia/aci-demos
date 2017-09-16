/**
 * a class for the Bar objects - @author Yane Frenski
 */

BarCube = function( color, x, z, val, valcolor, render, html_label, titles, minScaleVal, scaleDif, valHeight ) {
  
  // The render type - can be light and full
  this.renderType = render;
  
  //the 3D cube object
  this.barobj = null;
  
  //the 3D stroke (wireframe object) object
  this.wfobj = null;
  
  // the 3D object for the text label
  this.labelobj = null
  
  // should we set the wireframe
  this.hasWireframe = true;
  
  // should it have a label. The HTML one should point to a dom element
  this.hasLabel = true;
  this.hasHTMLLabel = html_label;
  
  // should it cast/receive shadows
  this.hasShadows = true;
  
  // the square size (x and z)
  this.sqsize = 100;
  
  // position in the quadrant
  this.posx = x;
  this.posz = z;
  
  // value & height
  this.val = val;
  this.h = ((val - minScaleVal)/scaleDif)*valHeight;
  if ( this.h==0 ) this.h = 0.5;
  
  // rows and column titles
  this.titles = titles;
  
  // main cube colour
  this.color = parseInt(color,16);
  this.htmlcolor = "#"+color;
  this.lumcolor = colorLuminance( color, 0.5 );
  this.darklumcolor = colorLuminance( color, -0.3 );
  this.valcolor = parseInt(valcolor,16);
  
  // label vars
  this.labelSize = 50;
  this.labelHeight = 5;
  this.labelFont = "helvetiker";
  
  // function to add the bar to the scene and position it
  this.addBar = function( target ){
    
    // Simple cube geometry for the bar
    var geometry = new THREE.CubeGeometry( this.sqsize, this.h, this.sqsize );
    // Material for the bars with transparency
    var material = new THREE.MeshPhongMaterial( {ambient: 0x000000,
                                                 color: this.color,
                                                 specular: 0x999999,
                                                 shininess: 100,
                                                 shading : THREE.SmoothShading,
                                                 opacity:0.8,
                                                 transparent: true
                                                } );
      
    //  if we want a lower quality renderer - mainly with canvas renderer
    if( this.renderType == 'light' ){
      var material = new THREE.MeshLambertMaterial( { color: this.color, 
                                          shading: THREE.FlatShading, 
                                          overdraw: true } );
      this.hasWireframe = false;
      this.hasShadows = false;
    }
      
                                                
    // Creating the 3D object, positioning it and adding it to the scene
    this.barobj = new THREE.Mesh( geometry, material );
    // Adds shadows if selected as an option
    if( this.hasShadows ){
      this.barobj.castShadow = true;
      this.barobj.receiveShadow = true;
    }
    this.barobj.position.x = xDeviation + this.posx*squareStep + squareStep/2;
    this.barobj.position.y = yDeviation + this.h/2;
    this.barobj.position.z = zDeviation + this.posz*squareStep + squareStep/2;
    target.add( this.barobj );
    
    // If we want to have wireframe (with a lighter colour) we attach 2nd obj
    if(this.hasWireframe){
      
      // Creates cube with the same size
      var geometry = new THREE.CubeGeometry( this.sqsize, this.h, this.sqsize );
      
      // Generates a wireframe material
      var material = new THREE.MeshBasicMaterial( { 
                         color: parseInt( this.lumcolor, 16 ),
                         wireframe:true} );
      this.wfobj = new THREE.Mesh( geometry, material );
      this.wfobj.receiveShadow = true;
      
      // Adds the wireframe object to the main one
      this.barobj.add( this.wfobj );
    }
    
    // If we want to have a label, we add a text object
    if( this.hasLabel ){
      
      var txt = this.val.toString();
      var curveSeg = 3;
      var material = new THREE.MeshPhongMaterial( { color: this.valcolor, 
                                                    shading: THREE.FlatShading } );
      
      // changing to simple values if lower rendering method selected
      if( this.renderType == 'light' ){
        curveSeg = 1;
        material = new THREE.MeshBasicMaterial( { color: this.valcolor } );
      } 
      
      // Create a three.js text geometry
      var geometry = new THREE.TextGeometry( txt, {
        size: this.labelSize,
        height: this.labelHeight,
        curveSegments: curveSeg,
        font: this.labelFont,
        weight: "bold",
        style: "normal",
        bevelEnabled: false
      });
      
      // Positions the text and adds it to the scene
      this.labelobj = new THREE.Mesh( geometry, material );
      this.labelobj.position.y += (this.h/2) + 50;
      this.labelobj.position.x -= (this.labelSize*txt.length/3);
      this.labelobj.position.z += 50;
      this.labelobj.rotation.y = Math.PI/4;
      // Adds shadows if selected as an option
      if( this.hasShadows ){
        this.labelobj.castShadow = true;
        this.labelobj.receiveShadow = true;
      }
      this.barobj.add( this.labelobj );
      
      // hides the label at the beginning
      this.hideLabel();
      
    }

  };
  
  // function to show the label
  this.showLabel = function( posx, posy){
  
    // Shows 3D label if set
    if( this.hasLabel ) {
      this.labelobj.visible = true;
    }
    
    // Shows HTML Label if set - uses jquery for DOM manipulation
    if ( this.hasHTMLLabel ) {
      this.hasHTMLLabel.html( this.titles.row + 
                              '<p>' + this.titles.col + ': '+val+'</p>' );
      this.hasHTMLLabel.show();
      // Back transformation of the coordinates
      posx = ( ( posx + 1 ) * window.innerWidth / 2 );
      posy = - ( ( posy - 1 ) * window.innerHeight / 2 );
      this.hasHTMLLabel.offset( { left: posx, top: posy } );
    }
    
  };
  
  // function to hide the label
  this.hideLabel = function(){
    
    // Hides 3D label if set
    if( this.hasLabel ) {
      this.labelobj.visible = false;
    }
    
    // Hides HTML Label if set - uses jquery for DOM manipulation
    if ( this.hasHTMLLabel ) {
      this.hasHTMLLabel.hide();
    }
    
  };
  
  this.reposition = function ( x, y, z ){
    this.barobj.position.set ( x, y, z );
  }
  
  this.reorientation = function ( x, y, z ){
    this.barobj.rotation.set ( x, y, z );
  }
  
  
};