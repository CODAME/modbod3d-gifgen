# modbod3d-gifgen

Input STL files captured by ModBod3D Scans + Output stylized GIF animations.

Default / Normal mapped look by default as preffered by [cabbibo](http://codame.com/artists/cabbibo) and [staRpauSe](http://codame.com/artists/staprause)

### Setup

Host the project on a PHP server and navigate to index.php. Models in the `/stl` directory will be listed below the gif preview. Click any name to load.

### Generating a GIF

Use the dat.gui sliders to dial in the perfect perspective and scale. Hit `Generate Gif`. If you've got the console open you can watch the frames collecting. A new window will spawn with your GIF in it, `right click -> save as`.

### Import Models from itSeez3d / Sketchfab

Convert OBJ to STL using [MeshLab](http://meshlab.sourceforge.net/). If you want to manipulate a model before converting it we recommend [Meshmixer](http://www.meshmixer.com/).