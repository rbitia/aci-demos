// ****************************************************************************
// sample data file for the bar charts
schema = { cols: [
                   { name:"Tourism", color:"be6700" }, 
                   { name:"Industry", color:"d0b500" }, 
                   { name:"Agriculture", color:"61c900" },
                   { name:"Services", color:"ff3300" } 
                  ],
                  rows:[{name:"Row 1"}]
                }

dataValues = [];

for( var i=0; i<schema.cols.length; i++ ){
  dataValues[i] = [];
  dataValues[i][0] = Math.floor((Math.random()*1000));
}