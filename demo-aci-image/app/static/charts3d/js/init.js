/**
 * DOM initialization script - @author Yane Frenski
 */

// Creates the edit/add data dialog box
$( "#div-databox" ).dialog({
            modal: true,
            draggable: false,
            title: "Edit your data",
            dialogClass: 'datadialog',
            disabled: true,
            width:600,
            height:400,
            maxWidth: 800,
            maxHeight: 600,
            resizable:true
        });
  
// Creates export dialog box
$( "#div-exportbox" ).dialog({
            modal: true,
            draggable: false,
            title: "Export your chart",
            dialogClass: 'datadialog',
            disabled: true,
            width:600,
            height:400,
            resizable: false
        });

// The tableSheet plugin
// inits the data for the columns and for the select - mainly for the world chart
var initDataCols = "";
if ( chartType == 'world' ) {
  initDataCols = "{'Afghanistan':'Afghanistan'";
  for (var c in country){
    if ( c!='Afghanistan' ){
      initDataCols += ",'"+c+"':'"+c+"'";
      $('#country_focus').append('<option value="'+c+'">'+c+'</option>');
    }
  }
  initDataCols += "}";
}
// calls the plugin
$('#datatable').tableSheet({
  initSchema: schema,
  initData: dataValues,
  maxRows: maxTableRows,
  exportText: 'Generate Chart',
  exportCall: function(param){
    schema = param.schema;
    dataValues = param.data;
    $( "#div-databox" ).dialog( "close" );
    backColor = $('#colorpick_bc').val();
    valTextColor = $('#colorpick_vt').val();
    if ( chartType == 'pie' ) {
      extrudeOpts.amount = parseInt($('#pie_height').val());
      initLegend($('#div-legend-data'), schema);
    }else {
      scaleTextColor = $('#colorpick_stc').val();
    }
    if ( chartType == 'world' ){
      countryFocus = $('#country_focus').val();
    }
    initScene();
    animateScene();
    $('#div-legend').children('h4').html($('#charttitle').val());
    $('#valuelabel').css('color', '#'+valTextColor);
  },
  imgUrl: staticUrl+'img/',
  colorpickerImg: staticUrl+'css/images/ui-colorpicker.png',
  selectInputCols: initDataCols,
  newRowText: defaultRowText,
  newColText: defaultColText,
  newCellValue: defaultCellVal
});

// link to open add/edit data dialog again
$( "#link-edit" ).click(function(){
  $( "#div-databox" ).dialog( "open" );
  return false;
});

// link to open the export box
$( "#link-export" ).click(function(){
  $( "#div-exportbox" ).dialog( "open" );
  return false;
});

// link to close the export box
$( "#link-export-close" ).click(function(){
  $( "#div-exportbox" ).dialog( "close" );
  return false;
});

// link to export the chart as image
$('div#link-export-image').click(function(){
  animateScene();
  var canvasData = renderer.domElement.toDataURL();
  $.ajax({
      type: "POST",
      url: exportImageUrl+'?h='+window.innerHeight+
            "&w="+window.innerWidth+"&c="+backColor,
      data: canvasData,
      contentType: "application/upload; charset=utf-8",
      success: function(data){
        $('div#result-export-image').html(data);
      }
  });
});

// link to export the chart as web
$('div#link-export-embed').click(function(){
  var exportData = {
    'title':      $('#charttitle').val(),
    'schema':     JSON.stringify(schema),
    'data':       JSON.stringify(dataValues),
    'settings':   'valHeight='+valHeight+';'+
                  'backColor=\''+backColor+'\';'+
                  'scaleTextColor=\''+scaleTextColor+'\';'+
                  'pieHeight='+pieHeight+';'+
                  'countryFocus="'+countryFocus+'";'+
                  'valTextColor=\''+valTextColor+'\';',
    'chartType':  chartType
  };
  
  $.ajax({
      type: "POST",
      url: exportUrl+'?h='+window.innerHeight+
            "&w="+window.innerWidth+"&c="+backColor,
      data: exportData,
      success: function(data){
        $('div#result-export-embed').html(data);
      }
  });
});

// Color pickers for the backround and text colours
$('#colorpick_bc').colorpicker({
    parts: ['swatches'],
    showOn: 'button',
    showCloseButton: true,
    buttonColorize: true,
    showNoneButton: false,
    alpha: true,
    buttonImage: staticUrl+'css/images/ui-colorpicker.png'
});

$('#colorpick_vt').colorpicker({
    parts: ['swatches'],
    showOn: 'button',
    showCloseButton: true,
    buttonColorize: true,
    showNoneButton: false,
    alpha: true,
    buttonImage: staticUrl+'css/images/ui-colorpicker.png'
});

if ( chartType == 'pie') {
  // sets the thickness param if initiated
  if( pieHeight ) $('#pie_height').val(extrudeOpts.amount.toString());
} else {
  $('#colorpick_stc').colorpicker({
      parts: ['swatches'],
      showOn: 'button',
      showCloseButton: true,
      buttonColorize: true,
      showNoneButton: false,
      alpha: true,
      buttonImage: staticUrl+'css/images/ui-colorpicker.png'
  });
  // Hides the color picker input fields
  $('#colorpick_stc').hide();
}

// Hides the color picker input fields
$('#colorpick_bc').hide();
$('#colorpick_vt').hide();

// closes the export dialog box
$( "#div-exportbox" ).dialog( "close" );

// perform some actions if samples are being called
if ( loadType == 'sample' ){
  
  // Closes the data dialog at the begining
  $( "#div-databox" ).dialog( "close" );
  
  // initiating the scene
  initScene();
  animateScene();
  $('#charttitle').val(chartTitle);
  $('#div-legend').children('h4').html($('#charttitle').val());
  
  if ( chartType == 'pie' ) {
    initLegend($('#div-legend-data'), schema);
  }
  
}
