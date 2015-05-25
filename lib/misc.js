;(function() {

    var BOUNDING_BOX_SIZE = 20;
    var IMAGE_SIZE = 28;

    window.onload = function() {
        var drawCanvas = new DrawCanvas("drawsurface");
        var chartCanvas = new ChartCanvas("chart");

        updateEvent = new CustomEvent('updateEvent')

         // bind event handler to clear button
        document.getElementById('clear').addEventListener('click', function() {
            drawCanvas.clear();
            chartCanvas.clear();
        }, false);

        document.addEventListener('updateEvent', function(e) {
            var imageData = drawCanvas.context.getImageData(0, 0, drawCanvas.canvas.width, drawCanvas.canvas.height);
            
            var image = imageData.data;
            var height = imageData.height;
            var width = imageData.width;

            // Make a square bounding box, multiple of BOUNDING_BOX_SIZE pixels
            var frameWidth = Math.round((box.maxX - box.minX) / BOUNDING_BOX_SIZE) * BOUNDING_BOX_SIZE;
            var frameHeight = Math.round((box.maxY - box.minY) / BOUNDING_BOX_SIZE) * BOUNDING_BOX_SIZE;

            var centerY = Math.round((box.minY + box.maxY) / 2);
            var centerX = Math.round((box.minX + box.maxX) / 2);

            if (frameHeight > frameWidth) {
                frameWidth = frameHeight;
            } else {
                frameHeight = frameWidth;
            }

            box.minY = centerY - frameHeight/2;
            box.maxY = centerY + frameHeight/2;
            box.minX = centerX - frameWidth/2;
            box.maxX = centerX + frameWidth/2;

            var boundingBox = new Array();
            for (i = box.minY; i < box.maxY; i++) {
                var row = new Array();
                for (j = box.minX; j < box.maxX; j++) {
                    row.push(gray_matrix[i][j]);
                }
                boundingBox.push(row);
            }

            var scale = boundingBox.length / BOUNDING_BOX_SIZE;

            var padding = {
                top: BOUNDING_BOX_SIZE / 2 - center.y + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
                bottom: center.y - BOUNDING_BOX_SIZE / 2 + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
                left: BOUNDING_BOX_SIZE / 2 - center.x + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
                right: center.x - BOUNDING_BOX_SIZE / 2 + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2
            }

            var correctMatrix = new Array();
            for (var i = 0; i < padding.top; i++) {
                correctMatrix.push(Array.apply(null, new Array(IMAGE_SIZE)).map(Number.prototype.valueOf,0));
            }
            for (var i = 0; i < BOUNDING_BOX_SIZE; i++) {

                var row = new Array();
                for (var j = 0; j < padding.left; j++) {
                    row.push(0);
                }

                for (var j = 0; j < BOUNDING_BOX_SIZE; j++) {
                    row.push(small_matrix[i][j]);
                }

                for (var j = 0; j < padding.right; j++) {
                    row.push(0);
                }
                correctMatrix.push(row);
            }
            for (var i = 0; i < padding.bottom; i++) {
                correctMatrix.push(Array.apply(null, new Array(IMAGE_SIZE)).map(Number.prototype.valueOf,0));
            }

            // Flatten matrix
            var nodes = [].concat.apply([], correctMatrix)

            nn = new Network();
            var output = nn.feedforward(nodes);
            var indexes = [0,1,2,3,4,5,6,7,8,9]

            var indexedOutput = zip([indexes, output]).sort(function(a, b) { return b[1] - a[1]});

            console.log(indexedOutput[0], indexedOutput[1], indexedOutput[2]);

            var classification = document.getElementById("classification");
            classification.innerHTML = indexedOutput[0][0];

            chartCanvas.draw([indexedOutput[0], indexedOutput[1], indexedOutput[2]])

        }, false);
    };


})();
