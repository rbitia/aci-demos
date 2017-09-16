// ****************************************************************************
// sample data file for the bar charts
schema = { 
               cols: [ { name:"CPU", color:"d17100" }
                     ],
               rows: [ { name: "Node 1" }, 
                       { name: "Node 2" },
                       { name: "Node 3" },
                       { name: "Node 4" },
                       { name: "Node 5" }
                     ]
             };
             
dataValues = [];

for( var i=0; i<schema.cols.length; i++ ){
  dataValues[i] = [];
  for (var j=0; j<schema.rows.length; j++ ){
    dataValues[i][j] = Math.floor((Math.random()*1000));
  }
}