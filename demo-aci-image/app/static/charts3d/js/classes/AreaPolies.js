/**
 * a class for the Bar objects - @author Yane Frenski
 */

AreaPoly = function( color, z, val, valcolor, extrude, render, html_label, titles, minScaleVal, scaleDif, valHeight ) {
  
  // The render type - can be light and full
  this.renderType = render;
  
  //the 3D cube object
  this.areaobj = null;
  
  // the 3D object for the text label
  this.labelobj = null;
  
  // should we set the wireframe
  this.hasWireframe = true;
  
  // should it have a label. The HTML one should point to a dom element
  this.hasLabel = true;
  this.hasHTMLLabel = html_label;
  
  // should it cast/receive shadows
  this.hasShadows = true;
  
  // position in the quadrant
  this.posz = z;
  
  // value & height
  this.val = val;
  
  // rows and column titles
  this.titles = titles;
  
  // vars to calculate the values
  this.minScaleVal = minScaleVal;
  this.scaleDif = scaleDif;
  this.valHeight = valHeight;
  
  // extrude options
  this.extrudeOpts = extrude;
  
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
  this.addArea = function( target ){
    
    // starting points for X and Y
    var startX = xDeviation + squareStep/2;
    var startY = yDeviation;
    
    // Shape geometry
    var shape = new THREE.Shape();
    shape.moveTo( startX, startY );
    
    for (var i = 0; i < this.val.length; i++) {
      shape.lineTo( startX + i*squareStep, startY + calcPointYPos( this.val[i], 
                                                                   this.minScaleVal,
                                                                   this.scaleDif,
                                                                   this.valHeight) );
    }
    shape.lineTo( startX + ( this.val.length - 1)*squareStep , startY);
    shape.lineTo( startX, startY );
    
    var geometry = new THREE.ExtrudeGeometry( shape, this.extrudeOpts );
    
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
    this.areaobj = new THREE.Mesh( geometry, material );
    // Adds shadows if selected as an option
    if( this.hasShadows ){
      this.areaobj.castShadow = true;
      this.areaobj.receiveShadow = true;
    }
    this.areaobj.position.z = zDeviation + this.posz*squareStep + squareStep/4 + 
                              this.extrudeOpts.amount/2;
    target.add( this.areaobj );
    
    
    // If we want to have a label, we add a text object
    if( this.hasLabel ){
      
      var curveSeg = 3;
      var material = new THREE.MeshPhongMaterial( { color: this.valcolor, 
                                                    shading: THREE.FlatShading } );
      
      // changing to simple values if lower rendering method selected
      if( this.renderType == 'light' ){
        curveSeg = 1;
        material = new THREE.MeshBasicMaterial( { color: this.valcolor } );
      }
      
      var txtOpts = {
        size: this.labelSize,
        height: this.labelHeight,
        curveSegments: curveSeg,
        font: this.labelFont,
        weight: "bold",
        style: "normal",
        bevelEnabled: false
      }
      
      
      this.labelobj = [];
      
      for ( var i=0; i<this.val.length; i++ ) {
        var txt = this.val[i].toString();
        // Create a three.js text geometry
        var geometry = new THREE.TextGeometry( txt, txtOpts );      
        // Positions the text and adds it to the scene
        this.labelobj[i] = new THREE.Mesh( geometry, material );
        this.labelobj[i].position.y += yDeviation + 
                                       calcPointYPos( this.val[i], 
                                                      this.minScaleVal,
                                                      this.scaleDif,
                                                      this.valHeight ) + 50;
        this.labelobj[i].position.x += xDeviation + (i+0.5)*squareStep;
        this.labelobj[i].position.z += this.extrudeOpts.amount/2 + 
                                       (this.labelSize/2)*txt.length;
        // this.labelobj[i].position.y = calcPointYPos( this.val[i] ) + 50;
        // this.labelobj[i].position.x += ( this.val[i].length - 1)*squareStep;
        this.labelobj[i].rotation.y = Math.PI/2;
        // Adds shadows if selected as an option
        if( this.hasShadows ){
          this.labelobj[i].castShadow = true;
          this.labelobj[i].receiveShadow = true;
        }
        this.areaobj.add( this.labelobj[i] );
        
      }
      
      // hides the label at the beginning
      this.hideLabel();
      
    }

  };
  
  // function to show the label
  this.showLabel = function( posx, posy){
  
    // Shows 3D label if set
    if( this.hasLabel ) {
      for ( var i=0; i<this.labelobj.length; i++ ){
        this.labelobj[i].visible = true; 
      }
    }
    
    // Shows HTML Label if set - uses jquery for DOM manipulation
    if ( this.hasHTMLLabel ) {
      var rowVals = "";
      for ( var i=0; i<this.titles.row.length; i++ ){
        rowVals += this.titles.row[i].name + ": " + this.val[i] + "<br>";
      }
      this.hasHTMLLabel.html( this.titles.col + 
                              '<p>' + rowVals + '</p>' );
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
      for ( var i=0; i<this.labelobj.length; i++ ){
        this.labelobj[i].visible = false; 
      }
    }
    
    // Hides HTML Label if set - uses jquery for DOM manipulation
    if ( this.hasHTMLLabel ) {
      this.hasHTMLLabel.hide();
    }
    
  };
  
  var calcPointYPos = function ( val , minScaleVal , scaleDif ,valHeight ) {
    return scaledVar = ( (val - minScaleVal)/scaleDif ) * valHeight;
  }
  
  
};