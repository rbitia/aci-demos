/**
 * a class for the Text objects on the scales - @author Yane Frenski
 */

ScaleText = function( text, type, pos, color, yStep ) {
  
  // the 3D object for the text label
  this.txtobj = null;
  
  // type: can be "val", "col", "row"
  this.ttype = type;
  
  // text
  this.txt = text;
  
  // position
  this.position = pos;
  
  // the difirance in position according y axis
  this.yStep = yStep;
  
  // the color
  this.color = 0x555555;
  if ( color ) this.color = parseInt(color,16);
  
  // label vars
  this.textSize = 30;
  this.textHeight = 5;
  this.textFont = "helvetiker";
  this.letterSize = 7 // this depends on the font
  
  // function to add the bar to the scene and position it
  this.addText = function( target ){
        
      // Create a three.js text geometry
    var geometry = new THREE.TextGeometry( this.txt, {
      size: this.textSize,
      height: this.textHeight,
      curveSegments: 3,
      font: this.textFont,
      weight: "bold",
      style: "normal",
      bevelEnabled: false
    });

    var material = new THREE.MeshPhongMaterial( { color: this.color, shading: THREE.FlatShading } );
      
    // Positions the text and adds it to the scene
    this.txtobj = new THREE.Mesh( geometry, material );
    
    if( this.ttype == "col" ) {
      this.txtobj.position.x = -xDeviation + squareStep/5;
      this.txtobj.position.y = -zDeviation - this.position * squareStep - 
                               squareStep/2;
    } else if ( type == "row" ){
      this.txtobj.rotation.z = Math.PI/2;
      this.txtobj.position.x = xDeviation + this.position * squareStep + 
                               squareStep/2;
      this.txtobj.position.y = zDeviation - squareStep/5 - 
                              this.txt.length * 
                              ( this.textSize -  this.letterSize );
    } else {
      this.txtobj.rotation.y = Math.PI/2;
      this.txtobj.position.x = -zDeviation;
      this.txtobj.position.z = squareStep/5 + 
                                this.txt.length * 
                                ( this.textSize -  this.letterSize );
      this.txtobj.position.y = yDeviation + this.position * yStep - 
                               this.textSize/2;
    }
    
    target.add( this.txtobj );

  };
  
  // function to show the label
  this.highlightText = function(){
  
    if(this.hasLabel){
      this.labelobj.visible = true;
    }  
    
  };
  
  // function to hide the label
  this.unhighlightText = function(){
  
    if(this.hasLabel){
      this.labelobj.visible = false;
    }  
    
  };
  
  
};