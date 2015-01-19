<?php
//Configuration
$base_path = empty($_GET['base_path']) ? '' : $_GET['base_path'];
$FILES = empty($_GET['files']) ? 1 : $_GET['files'];

$WIDTH = 200;
$HEIGHT = 200;
$FONT_SIZE = 20;
?>

<!DOCTYPE HTML>
<html manifest="<?php print $base_path ?>manifest.appcache">
<head>
  <title>offline.html</title>
  <script src="<?php print $base_path ?>sites/all/modules/jquery_update/replace/jquery/1.10/jquery.min.js"></script>
  <script type="text/javascript">
    var lastUpdate = 0;
    var TIME_DIFF = 100; //ms
    var files_total = <?php print $FILES?>;
    var max = 1.0;

    $(document).ready(function($) {
      var file = -1;
      $(window.applicationCache).on('cached downloading updateready checking progress error noupdate',
        function(e) {
          //make a delayed output
          var delay = 0;
          var date = new Date();
          var now = date.getTime();
          if(lastUpdate != 0){
            lastUpdate = lastUpdate + TIME_DIFF;
            delay = lastUpdate - now;
            if(delay < 0){
              delay = 0;
              lastUpdate = now;
            }
          } else {
            lastUpdate = now;
          }

          setTimeout(function(){
            var message = '';
            switch (e.type) {
              case 'error':
                message = "Error";
                jQuery('path').css('fill', 'red');
                error();
                break;
              case 'cached':
              case 'updateready':
                message = "Finished";
                finished();
                break;
              case 'checking':
                jQuery('path').css('fill', '#339933');
                message = "Checking";
                break;
              case 'noupdate':
                message = "No update";
                break;
              case 'downloading':
              case 'progress':
                var progress = ++file / files_total;
                if(progress >= max) {
                  progress = max;
                }
                message = parseInt(progress * 100) + "%";
                break;
            }

            drawProgress(progress);
            document.getElementById("mytext").textContent = message;
          }, delay);

        });
    });

    /*
     Functions that act as hooks for the parent window.
     Overwrite these with callbacks.
     */
    function started(){
      console.log('Started');
    }


    function finished(){
      console.log('Finished');
    }

    function error(){
      console.log('Error');
    }

    function drawProgress(percent){
      if(isNaN(percent)) {
        return;
      }
      percent = parseFloat(percent);
      var bar = document.getElementsByClassName ('progress-radial-bar')[0]
        , α = percent * 360
        , π = Math.PI
        , t = 90
        , w = 153;
      if(α >= 360) {
        α = 359.999;
      }
      var r = ( α * π / 180 )
        , x = Math.sin( r ) * w
        , y = Math.cos( r ) * - w
        , mid = ( α > 180 ) ? 1 : 0
        , animBar = 'M 0 0 v -%@ A %@ %@ 1 '.replace(/%@/gi, w)
          + mid + ' 1 '
          + x + ' '
          + y + ' z';
      bar.setAttribute( 'd', animBar );
    }
  </script>
  <style>
    .progress-radial-track {
      fill: #A2C139;
    }

    .progress-radial-bar {
      fill: #339933;
    }
  </style>
</head>
<body width="<?php print $WIDTH?>" height="<?php print $HEIGHT?>">
<center>
  <svg class="progress-radial" width="<?php print $WIDTH?>" height="<?php print $HEIGHT?>" viewBox="0 0 <?php print $WIDTH?> <?php print $HEIGHT?>" shape-rendering="geometricPrecision">
    <defs>
      <mask id="circle_mask" x="0" y="0" width="<?php print $WIDTH?>" height="<?php print $HEIGHT?>" maskUnits="userSpaceOnUse">
        <circle cx="<?php print $WIDTH*0.5?>" cy="<?php print $HEIGHT*0.5?>" r="<?php print $HEIGHT*0.5?>" stroke-width="0" fill="black" opacity="1"/>
        <circle cx="<?php print $WIDTH*0.5?>" cy="<?php print $HEIGHT*0.5?>" r="<?php print $HEIGHT*0.5?>" stroke-width="0" fill="white" opacity="1"/>
        <circle class="progress-radial-mask-inner" cx="<?php print $WIDTH*0.5?>" cy="<?php print $HEIGHT*0.5?>" r="<?php print $HEIGHT*0.4?>" stroke-width="0" fill="black" opacity="1"/>
      </mask>
    </defs>
    <g mask="url(#circle_mask)">
      <circle class="progress-radial-track" cx="<?php print $WIDTH*0.5?>" cy="<?php print $HEIGHT*0.5?>" r="<?php print $HEIGHT*0.5?>" stroke-width="0" opacity="1"/>
      <path class="progress-radial-bar" transform="translate(<?php print $WIDTH*0.5?>, <?php print $HEIGHT*0.5?>)"
            d="M 0 0">
      </path>
    </g>
    <g style="font-family: Space Toaster;font-size:<?php print $FONT_SIZE?>pt; fill:black;">
      <text text-anchor="middle" id="mytext" x="<?php print $WIDTH*0.5?>" y="<?php print $HEIGHT*0.55?>" fill="white">  </text>
    </g>
  </svg>
</center>
</body>
</html>
