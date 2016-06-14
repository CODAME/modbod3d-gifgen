<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>ModBod3D GifGen</title>
	<link rel="stylesheet" href="css/reset.css">
	<!--[if IE]>
		<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
	<script>
		<? if( $_GET['file'] ){
			$file = $_GET['file'];
			echo "var modelToLoad = 'stl/$file';";
		}?>
	</script>
	<script src="js/vendor/jquery-1.11.1.min.js"></script>
	<script src="js/vendor/underscore-min.js"></script>
	<script src="js/vendor/dat.gui.min.js"></script>

	<script src="js/vendor/three.min.js"></script>
	<script src="js/vendor/OBJLoader.js"></script>
	<script src="js/vendor/OrbitControls.js"></script>
	<script src="js/vendor/STLLoader.js"></script>

	<script src="js/vendor/gif.js"></script>
    <script src="js/vendor/gif.worker.js"></script>

	<script src="js/main.js"></script>
</head>

<body id="home">
	<!--
	<div id="drop-zone"></div>
	-->
	<div id="content">

		<div id="container"></div>

		<br>
		<button id="generate-button">Generate Gif</button>
		<br>
		<br>
		<input type="file" id="files" name="files[]" />
		<br>
		<br>
		<output id="list"></output>

		<ul>
			<?

				$files = glob('stl/*');
				foreach ($files as $f){
				  $tmp[basename($f)] = filemtime($f);
				}
				asort($tmp);
				$files = array_keys($tmp);

				// $files = scandir('./stl');
				foreach( $files as $file ){
					if( $file == '.' || $file == '..' || $file == '.DS_Store' ){ continue; }
					echo "<li><a href='?file=$file'>$file</a></li>";
				}
			?>
		</ul>

	</div>

</body>
</html>
