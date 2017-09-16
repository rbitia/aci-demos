<?php

$dst_width = $_GET['w'];
$dst_height = $_GET['h'];
$b_col = hexToRGB($_GET['c']);

$base_url = "http://localhost/charts3d/files/";

if (isset($GLOBALS["HTTP_RAW_POST_DATA"])){
  
  // Get the data
  $image_data=$GLOBALS['HTTP_RAW_POST_DATA'];
  $filter_data=substr($image_data, strpos($image_data, ",")+1);
  $decoded_data=base64_decode($filter_data);
    
  $filename = '../files/'.strtotime("now").'.png';
    
  // Save file.
  if ( $fp = fopen( $filename, 'wb' ) ){
    fwrite( $fp, $decoded_data);
    fclose( $fp );
    
    $im = imagecreatetruecolor($dst_width, $dst_height);
    $col = imagecolorallocate($im, $b_col['r'], $b_col['g'], $b_col['b']);
    imagefill($im, 0, 0, $col);
    
    $chart_img = imagecreatefrompng($filename);
    imagesavealpha($chart_img, false);
    imagealphablending($chart_img, false);
    
    imagecopy($im, $chart_img, 0, 0, 0, 0, $dst_width, $dst_height);
    
    imagepng($im, $filename, 9);
    
    echo '<a href="exporters/get_image.php?file='.$base_url.$filename
                    .'" target="_blank">Click here to download the image</a>';
    
  }else{
    echo "Failed to save image";
  }

}else{
  echo "No image to upload!";
}

function hexToRGB($hexval){
  
  $r = hexdec(substr($hexval,0,2));
  $g = hexdec(substr($hexval,2,2));
  $b = hexdec(substr($hexval,4,2));

  return array ('r'=>$r, 'g'=>$g, 'b'=>$b);
}

  

?>