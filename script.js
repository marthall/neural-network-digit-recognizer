;(function() {
    
    function zip(arrays) {
        return arrays[0].map(function(_,i){
            return arrays.map(function(array){return array[i]})
        });
    }

    function dotproduct(a,b) {
        var n = 0, lim = Math.min(a.length,b.length);
        for (var i = 0; i < lim; i++) n += a[i] * b[i];
        return n;
    }

    function sigmoid(z) {
        return 1/(1+Math.exp(-z))
    }

    var Network = function() {};

    Network.prototype.feedforward = function(a) {
        var data = zip([biases, weights]);  

        // Iterate through layers
        for (var i = 0; i < data.length; i++) {
            w = data[i][1];
            b = data[i][0];

            // Iterate through nodes in second of the two layers (30, 10)
            var tmp = new Array();
            for (var mid_node = 0; mid_node < w.length; mid_node++) {
                tmp.push(sigmoid(dotproduct(a, w[mid_node]) + b[mid_node][0]));
            }
            a = tmp;
        }
        return a;
    }

    var BOUNDING_BOX_SIZE = 20;
    var IMAGE_SIZE = 28;

    var pixelated = new Image();

    var DrawCanvas = function(canvasId) {
        canvas = document.getElementById(canvasId);
        var context = canvas.getContext('2d');

        canvas.width = 300
        canvas.height = 300;
        
        context.lineWidth = 14;
        context.lineJoin = context.lineCap = 'round';
        context.shadowBlur = 5;
        context.shadowColor = 'rgb(40, 40, 40)';
        
        pencil = new pencil();

        // Attach the mousedown, mousemove and mouseup event listeners
        canvas.addEventListener('mousedown', draw_event, false);
        canvas.addEventListener('mousemove', draw_event, false);
        canvas.addEventListener('mouseup',   draw_event, false);

        this.getImage = function () {
            return canvas.toDataURL();
        }

        this.getCanvas = function () {
            return canvas;
        }

        function pencil () {
            self = this;
            self.active = false;

            this.mousedown = function (event) {
                context.beginPath();
                context.moveTo(event._x, event._y);
                self.active = true;
            };

            this.mousemove = function (event) {
                if (self.active) {
                    context.lineTo(event._x, event._y);
                    context.stroke();
                }
            }

            this.mouseup = function (event) {
                if (self.active) {
                    self.mousemove(event);
                    self.active = false;
                    document.dispatchEvent(updateEvent);
                }
            }

            draw_event = function (event) {
                // Firefox
                if (event.layerX || event.layerX == 0) {
                    event._x = event.layerX;
                    event._y = event.layerY;
                // Opera
                } else if (event.offsetX || event.offsetX == 0) {
                    event._x = event.offsetX;
                    event._y = event.offsetY;
                }

                // Call the event handler of the tool
                var func = self[event.type];
                if (func) {
                    func(event);
                }
            }
        } 

         // bind event handler to clear button
        document.getElementById('clear').addEventListener('click', function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }, false);

        return canvas;
    };

    window.onload = function() {
        draw = new DrawCanvas("drawsurface");

        updateEvent = new CustomEvent('updateEvent', {'detail': draw})

        document.addEventListener('updateEvent', function(e) {
            var canvas = e.detail;
            var context = canvas.getContext('2d');
            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // context.clearRect (0, 0, canvas.width, canvas.height);
            
            var image = imageData.data;
            var height = imageData.height;
            var width = imageData.width;

            // Turns all the pixels into single gray values
            // g = (r, g, b, a)
            var gray = new Array(width*height);
            for (var i = 0; i < image.length; i+=4) {
                gray[i/4] = (1 - (image[i]/255 + image[i+1]/255 + image[i+2]/255) / 3) * (image[i+3] / 255);
            }

            // Transforms the array into a width*height matrix 
            gray_matrix = new Array();
            for (var i = 0; i < width*height; i+= width) {
                gray_matrix.push(gray.slice(i, i+width))
            }

            function getBoundingBox(image) {

                minY:
                for (var y = 0; y < image.length; y++) {
                    for (var x = 0; x < image[y].length; x++) {
                        if (image[y][x] != 0) {
                            minY = y
                            break minY;
                        }
                    }
                }

                minX:
                for (var x = 0; x < image.length; x++) {
                    for (var y = 0; y < image[x].length; y++) {
                        if (image[y][x] != 0) {
                            minX = x
                            break minX;
                        }
                    }
                }

                maxY:
                for (var y = image.length-1; y >= 0; y--) {
                    for (var x = 0; x < image[y].length; x++) {
                        if (image[y][x] != 0) {
                            maxY = y
                            break maxY;
                        }
                    }
                }

                maxX:
                for (var x = image.length-1; x >= 0; x--) {
                    for (var y = 0; y < image.length; y++) {
                        if (image[y][x] != 0) {
                            maxX = x
                            break maxX;
                        }
                    }
                }

                return minY, minX, maxY, maxX
            }

            var minY, minX, maxY, maxX = getBoundingBox(gray_matrix)

            // Make a square bounding box, multiple of BOUNDING_BOX_SIZE pixels
            var frameWidth = Math.round((maxX - minX) / BOUNDING_BOX_SIZE) * BOUNDING_BOX_SIZE;
            var frameHeight = Math.round((maxY - minY) / BOUNDING_BOX_SIZE) * BOUNDING_BOX_SIZE;

            var centerY = Math.round((minY + maxY) / 2);
            var centerX = Math.round((minX + maxX) / 2);

            if (frameHeight > frameWidth) {
                frameWidth = frameHeight;
            } else {
                frameHeight = frameWidth;
            }

            minY = centerY - frameHeight/2;
            maxY = centerY + frameHeight/2;
            minX = centerX - frameWidth/2;
            maxX = centerX + frameWidth/2;

            console.log(minY, minX, maxY, maxX);

            // Delete this if not drawing square
            // context.lineWidth = 1;
            // context.shadowBlur = 0;
            // context.strokeStyle = 'red';
            // context.rect(minX, minY, maxX-minX, maxY-minY);
            // context.stroke();

            var boundingBox = new Array();
            for (i = minY; i < maxY; i++) {
                var row = new Array();
                for (j = minX; j < maxX; j++) {
                    row.push(gray_matrix[i][j]);
                }
                boundingBox.push(row);
            }

            var scale = boundingBox.length / BOUNDING_BOX_SIZE;

            // Downscale the matrix into a BOUNDING_BOX_SIZE matrix
            small_matrix = new Array();
            for (var i = 0; i < boundingBox.length; i+= scale) {
                var row = new Array();
                for (var j = 0; j < boundingBox[i].length; j+= scale) {
                    var tmp = 0;
                    for (var m = i; m < i+scale; m++) {
                        for (var n = j; n < j+scale; n++) {
                            tmp += boundingBox[m][n];
                        }
                    }
                    row.push(tmp/(scale*scale));
                }
                small_matrix.push(row);
            }

            console.log(small_matrix);

            function calculateCenterOfMass(matrix, threshold) {
                var centerY = 0, centerX = 0;
                var countY = 0, countX = 0;

                for (var y = 0; y < matrix.length; y++) {
                    for (var x = 0; x < matrix[y].length; x++) {
                        if (matrix[y][x] > threshold) {
                            centerY += y;
                            countY++;
                            centerX += x;
                            countX++;
                        }
                    }
                }
                return {
                    y: Math.round(centerY/countY),
                    x: Math.round(centerX/countX)
                };
            }

            var center = calculateCenterOfMass(small_matrix, 0.5)

            console.log(center.y, center.x);

            var padding = {
                top: BOUNDING_BOX_SIZE / 2 - center.y + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
                bottom: center.y - BOUNDING_BOX_SIZE / 2 + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
                left: BOUNDING_BOX_SIZE / 2 - center.x + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
                right: center.x - BOUNDING_BOX_SIZE / 2 + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2
            }

            console.log(padding);

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

            var i = output.indexOf(Math.max.apply(Math, output));
            console.log(output);
            console.log(i);

        }, false);
    };


})();
