/**
 * a class for the Pie objects - @author Yane Frenski
 */

PiePart = function( val, totalval, radius, angprev, pos, extrude, color, valcolor, render, html_label, titles ) {
  
  // The render type - can be light and full
  this.renderType = render;
  
  //the 3D cube object
  this.pieobj = null;
  
  // the 3D object for the text label
  this.labelobj = null
  
  // should it have a label. The HTML one should point to a dom element
  this.hasLabel = true;
  this.hasHTMLLabel = html_label;
  
  // should it cast/receive shadows
  this.hasShadows = true;
  
  // the position (usually 0;0;0)
  this.position = pos;
  
  // the radius size 
  this.radius = radius;
  
  // the previous angle - this one should start from it
  this.angPrev = angprev;
  
  // value and Total
  this.val = val;
  this.valTotal = totalval;
  
  // rows and column titles
  this.titles = titles;
  
  // extrude options
  this.extrudeOpts = extrude;
  
  // main cube colour
  this.color = parseInt(color,16);
  this.htmlcolor = "#"+color;
  this.valcolor = parseInt(valcolor,16);
  this.lumcolor = colorLuminance( color, 0.5 );
  this.darklumcolor = colorLuminance( color, -0.6 );
  
  // label vars
  this.labelSize = 60;
  this.labelHeight = 6;
  this.labelFont = "helvetiker";
  
  // function to add the bar to the scene and position it
  this.addPie = function( target ){
    
    // Material for the bars with transparency
    var material = new THREE.MeshPhongMaterial( {ambient: 0x000000,
                                                 color: this.color,
                                                 specular: 0x777777,
                                                 shininess: 100,
                                                 shading : THREE.SmoothShading,
                                                 transparent: true
                                                } );
                                                
    //  if we want a lower quality renderer - mainly with canvas renderer
    if( this.renderType == 'light' ){
      var material = new THREE.MeshLambertMaterial( { color: this.color, 
                                                      shading: THREE.FlatShading, 
                                                      overdraw: true } );
    }
    
    // Creats the shape, based on the value and the radius
    var shape = new THREE.Shape();
    var angToMove = (Math.PI*2*(this.val/this.valTotal));
    shape.moveTo(this.position.x,this.position.y);
    shape.arc(this.position.x,this.position.y,pieRadius,this.angPrev,
              this.angPrev+angToMove,false);
    shape.lineTo(this.position.x,this.position.y);
    nextAng = this.angPrev + angToMove;

    var geometry = new THREE.ExtrudeGeometry( shape, this.extrudeOpts );

    this.pieobj = new THREE.Mesh( geometry, material );
    this.pieobj.rotation.set(90,0,0);
                                          
    // Creating the 3D object, positioning it and adding it to the scene
    this.pieobj = new THREE.Mesh( geometry, material );
    this.pieobj.rotation.set(Math.PI/2,0,0);
    // Adds shadows if selected as an option
    if( this.hasShadows ){
      this.pieobj.castShadow = true;
      this.pieobj.receiveShadow = true;
    }
    target.add( this.pieobj );
    
    // If we want to have a label, we add a text object
    if(this.hasLabel){
      
      var percent = Math.round( (this.val/this.valTotal*100) * 10 ) / 10;
      var txt = this.val.toString() + " (" +
                percent.toString() +"%)";
      var curveSeg = 3;
      var material = new THREE.MeshPhongMaterial( { color: this.valcolor, 
                                                    shading: THREE.FlatShading } );
      
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
      
      // calculates the positon of the text
      this.valcolor = parseInt(valcolor,16);
      var txtAng = this.angPrev + angToMove/2;
      var txtRad = this.radius * 0.8;
      
      
      // Positions the text and adds it to the scene
      this.labelobj = new THREE.Mesh( geometry, material );
      this.labelobj.position.z -= this.labelSize/2;
      this.labelobj.position.x = txtRad * Math.cos(txtAng);
      this.labelobj.position.y = txtRad * Math.sin(txtAng);
      this.labelobj.rotation.set(3*Math.PI/2,0,0);
      
      // Adds shadows if selected as an option
      if( this.hasShadows ){
        this.labelobj.castShadow = true;
        this.labelobj.receiveShadow = true;
      }
      this.pieobj.add( this.labelobj );
      
      // hides the label at the beginning
      this.hideLabel();
      
    }
    
    return nextAng;
    
  };
  
  // function to show the label
  this.showLabel = function( posx, posy ){
  
    // Shows 3D label if set
    if(this.hasLabel){
      this.labelobj.visible = true;
    }
    
    // Shows HTML Label if set - uses jquery for DOM manipulation
    if ( this.hasHTMLLabel ) {
      this.hasHTMLLabel.html( this.titles.col + 
                              '<p>'+val+'</p>' );
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
  
  
};