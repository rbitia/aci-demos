/**
 * a general settings script - @author Yane Frenski
 */


 // urls
var staticUrl = "static/charts3d/";
var rootUrl = "/";
var exportUrl = rootUrl+'save/';
var exportImageUrl = "exporters/export_image.php";
// table rows and cols maximum
var maxTableRows = 50;
var maxTableCols = 50;
// size of one square in real 3d units
var squareStep = 200;
// maximum height of the walls (y and z)
var valHeight = 1000;
// Background Color
var backColor = "000000";
// Colour for the text on the x and y scales
var scaleTextColor = "eeeeee";
// Colour for the text on each bar
var valTextColor = "ffffff";
// pie radius
var pieRadius = 750;
// the thickness of the pie
var pieHeight = 150;
// extrude options
var extrudeOpts = { amount: pieHeight, 
                    bevelEnabled: true, 
                    bevelSegments: 5, 
                    steps: 5 };
// world radius
var globeRadius = 750;
// country focus
countryFocus = "Libya";
// init the schema and data array
var schema = { cols: [ { name: "Column Name", color:"ae00e6" }],
              rows: [ { name: "Row Name" } ] };
var dataValues = [[0]];
// for the table default texts/vaules
var defaultRowText = "Row Name";
var defaultColText = "Column Name";
var defaultCellVal = 0;
// Image to replace the canvas if neither WebGL nor Canvas2D supported
var replaceImage = null;

switch(chartType){
  case 'bar':
    break;
  case 'pie':
    maxTableRows = 1;
    break;
  case 'area':
    valHeight = 600;
    extrudeOpts = { amount: squareStep/4, 
                    bevelEnabled: true, 
                    bevelSegments: 5, 
                    steps: 5 };
    break;
  case 'world':
    maxTableRows = 1;
    schema.cols[0].name = "Afghanistan";
    valHeight = 400;
    defaultColText = "Afghanistan"
    break;
  default:
    
  }