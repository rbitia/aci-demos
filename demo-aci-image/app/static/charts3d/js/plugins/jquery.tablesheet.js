(function($) {
  $.fn.tableSheet = function(options) {
    
    // Getting the table and tbody params
    var table = $(this);
    table.append('<tbody></tbody>');
    var tbody = table.children('tbody');
    
    // gets the parameters
    var opts = $.extend({}, $.fn.tableSheet.defaults, options);
    
    // initializing the number of rows
    var initSchema = opts.initSchema;
    var initData = opts.initData;
    var rows = initSchema.rows.length;
    var cols = initSchema.cols.length;
    
    // the namespace
    nspace = opts.namespace;
    
    // adds columns from the init data and schema
    var colsToAdd = '';
    for( var i=0; i<cols; i++ ){
      colsToAdd += '<td class="rowcol" id="'+nspace+
                   'col'+i+'"><input id="colorpick'+i+'" type="text" size="1"'+
                   'value="'+initSchema.cols[i].color+
                   '" /><span>'+initSchema.cols[i].name+'</span></td>';
    } 
    tbody.append('<tr><td class="rowcol" style="padding:0">'+
                  '<div class="addremove" style="text-align:right;"><img id="'+nspace+
                  'addCol" src="'+'static/charts3d/img/add2.png"><br>'+
                  '<img id="'+nspace+'remCol" src="'+'static/charts3d/img/rem1.png"></div>'+
                  '<div style="clear:both;"></div>'+
                  '<div class="addremove" style="margin-top:0"><img id="'+nspace+
                  'addRow" src="'+'static/charts3d/img/add1.png"><img id="'+nspace+
                  'remRow" src="'+'static/charts3d/img/rem2.png"></div></td>'+colsToAdd+'</tr>');
    
    // adds rows from the init data and schema
    var rowsToAdd = '';
    for( var i=0; i<rows; i++ ){
      rowsToAdd += '<tr id="'+nspace+'row'+i+'"><td class="rowcol" id="">'+
                    initSchema.rows[i].name+'</td>';
      for( var j=0; j<cols; j++ ){
        rowsToAdd += '<td id="'+nspace+'cell'+j+'_'+i+'" class="cell">'+
                      initData[j][i]+'</td>';
      }
      rowsToAdd += '</tr>';
    }
    
    tbody.append(rowsToAdd);
  
   
   // adds the export button
    table.after('<div style="height:20px">&nbsp;</div>'+
                '<div id="'+nspace+'exportbut" class="exportbut">'+
                opts.exportText+'</div>');
             
    // binds the click events
    $('#'+nspace+'addCol').click(function(){ addColumn(); });
    $('#'+nspace+'addRow').click(function(){ addRow(); });
    $('#'+nspace+'remCol').click(function(){ removeColumn(); });
    $('#'+nspace+'remRow').click(function(){ removeRow(); });
    $('#'+nspace+'exportbut').click(function(){ exportData(); });
    
    // function for adding a collumn
    var addColumn = function () {
      if( rows < opts.maxCols ){
      // Adds the header column to the tbody
        tbody.children('tr:first')
           .children('td#'+nspace+'col'+(cols-1))
           .after('<td class="rowcol" id="'+nspace+'col'+cols+'">'+
           '<input id="colorpick'+cols+
           '" type="text" size="1" value="'+randomHexNum()+'" />'+
           ' <span>'+opts.newColText+'</span></td>');
        // adds the color picker function
        addColPick ( $( '#colorpick'+cols ) );
        // adds the text editing plugin
        addJeditable ( $('#'+nspace+'col'+cols).children('span'), 'string', opts.selectInputCols );
        for ( var i=0; i<rows; i++ ){
            tbody.children('tr#'+nspace+'row'+i)
               .append('<td class="cell" id="'+nspace+'cell'+cols+'_'+i+'">'
               +opts.newCellValue+'</td>');       
            addJeditable ( $('#'+nspace+'cell'+cols+'_'+i), 'float', opts.selectInputData );
          }
        cols ++;
      }
    };
    
    // function for adding a row
    var addRow = function () {
      if( rows < opts.maxRows ){
        // apends every row and column to the table
        var html = '<tr id="'+nspace+'row'+rows+'"><td class="rowcol">'
                  +opts.newRowText+'</td>';
        for ( var i=0; i<cols; i++ ){
          html += '<td class="cell" id="'+nspace+'cell'+i+'_'+rows+'">'
                  +opts.newCellValue+'</td>';
        }
        html += '</tr>';
        tbody.append(html);
        // adds the plugins - jeditable and color pickur
        addJeditable ( $('#'+nspace+'row'+rows).children('td:first'), 'string', opts.selectInputRows );
      
        for ( var i=0; i<cols; i++ ){
          addJeditable ( $('#'+nspace+'cell'+i+'_'+rows), 'float', opts.selectInputData );
        }
        rows ++;
      }
    };
    
    // function for removing a row
    var removeRow = function () {
      if( rows > 1 ){
        rows--;
        tbody.children('tr:last').remove();
      }
    };
    
    // function for removing a column
    var removeColumn = function () {
      if( cols > 1 ){
        cols--;
        tbody.children('tr:first').children('#'+nspace+'col'+cols).remove();
        for ( var i=0; i<rows; i++ ){
          tbody.children('tr#'+nspace+'row'+i).children('td:last').remove();
        }
      }
    }
    
    var addJeditable = function ( el, type, selectdata ) {
      var jtype = "text";
      if ( selectdata !="" ) jtype = "select";
      el.editable(function(value, settings) { 
          if( type == 'float' ){
            value = parseFloat(value);
            if ( isNaN (value) ) value = 0;
          }
          return ( value );
       }, { 
          type    : jtype,
          data    : selectdata,
          onblur  : 'submit' 
      });
    }
    
    var addColPick = function ( el, type ){
      el.colorpicker({
          parts: ['swatches'],
          showOn: 'button',
          showCloseButton: true,
          buttonColorize: true,
          showNoneButton: false,
          alpha: true,
          buttonImage: opts.colorpickerImg
      });
      el.hide();
    }
    
    var exportData = function (){
      var schema = { cols:[], rows: []};
      var data = [];
      
      // exporting the column data and the values
      for ( var i=0; i<cols; i++ ){
        schema.cols[i] = {};
        schema.cols[i].name = tbody.children('tr:first').
                              children('td#'+nspace+'col'+i).
                              children('span').html();
        schema.cols[i].color =tbody.children('tr:first').
                              children('td#'+nspace+'col'+i).
                              children('input#colorpick'+i).val();
        // exporting the values
        data[i] = [];
        for( var j=0; j<rows; j++ ){
          data[i][j] = parseFloat($('#'+nspace+'cell'+i+'_'+j).html());
        }
      }
     
      
      // exporting the row data
      for( var i=0; i<rows; i++){
        schema.rows[i] = {};
        schema.rows[i].name = tbody.children('tr#'+nspace+'row'+i).
                              children('td').html();
      }
      
      // The export callback function if set
      if(opts.exportCall!=''){
        opts.exportCall( {schema: schema, data: data} );
      }
    }
    
    // Function for generating random hex numbers
    var randomHexNum = function () {
      return (Math.random()*0xFFFFFF<<0).toString(16);
    }
    
    // Adds jeditable to the initialized rows
    for( var i=0; i<rows; i++ ){
      addJeditable ( $('#'+nspace+'row'+i).children('td:first'), 'string', opts.selectInputRows );
    }
    for( var i=0; i<cols; i++ ){
      // Adds jeditable to the initialized columns
      addJeditable ( $('#'+nspace+'col'+i).children('span'), 'string', opts.selectInputCols );
      // Adds the color picker elements
      addColPick ( $( '#colorpick'+i ) );
      // Adds jeditable to the initialized data cells
      for( var j=0; j<rows; j++ ){
        addJeditable ( $('#'+nspace+'cell'+i+'_'+j), 'float', opts.selectInputData );
      }
    }
  

  }
  //Default configuration:
  $.fn.tableSheet.defaults = {
    addColText : 'column: ',
    addRowText : 'row: ',
    maxRows : 50,
    maxCols : 50,
    namespace: 'jtsheet_',
    exportText: 'Export',
    exportCall: '',
    initSchema: { cols: [ { name: "Column 1", color:"ae00e6" }],
                  rows: [ { name: "Row 1" } ] },
    initData: [[0]],
    imgUrl: 'img/',
    colorpickerImg: 'css/images/ui-colorpicker.png',
    selectInputCols: "",
    selectInputRows: "",
    selectInputData: "",
    newColText: "Column",
    newRowText: "Row",
    newCellValue: 0
  };
  
  /**** plugin parameters *****************************************************
  *****************************************************************************
  
    * addColText:        Text to be shown on a add column link (not used now)
    * addRowText:        Text to be shown on a add row link (not used now)
    * maxRows:           Maximum number of rows allowed to be added
    * maxCols:           Maximum number of colums allowed to be added
    * namespace:         Namespace for the id elements to prevent collisions
    * exportText:        Text for the export button
    * exportCall:        A call back function when exporting the data
    * initSchema,
      initData:          If we want to initiate the table with some schema and
                         data. By default it's one cell with one column and row
                         initSchema must be object with columns and rows that
                         are arays containing objects. Should look like this:
                         {  
                            cols: [ {name: "", color:""}, ....],
                            rows: [ {name: "" }, ....]
                         }
                         initData must be two dimentional array with the size
                         of the number of rows and columns in the initSchema
    * imgUrl:            The url for the images
    * colorpickerImg:    'css/images/ui-colorpicker.png'
    * selectInputCols:   If set as "{'select':'select', 'select':'select'...}"
                         makes the text for changing as select elements instead
                         of textareas. By default it's empty and shows textarea
    * selectInputRows:   Same as the previous one, but for the rows
    * selectInputData:   Same as the previous one, but for the data cells
    * newColText:        The default text when adding a new column
    * newRowText:        The default text when adding a new column
    * newCellValue:      The default text when adding a new data cell
                         
  ****************************************************************************/

  })(jQuery);