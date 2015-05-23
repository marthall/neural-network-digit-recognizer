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

    var DIM = 28;
    var SCALE = 8;
    var HEIGHT = WIDTH = DIM*SCALE

    var pixelated = new Image();

    var DrawCanvas = function(canvasId) {
        canvas = document.getElementById(canvasId);
        var context = canvas.getContext('2d');

        canvas.width = WIDTH
        canvas.height = HEIGHT;
        
        context.lineWidth = 20;
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
            
            image = imageData.data;

            // Turns all the pixels into single gray values
            // g = (r, g, b, a)
            var gray = new Array(WIDTH*HEIGHT);
            for (var i = 0; i < image.length; i+=4) {
                gray[i/4] = (1 - (image[i]/255 + image[i+1]/255 + image[i+2]/255) / 3) * (image[i+3] / 255);
            }

            // Transforms the array into a WIDTH*HEIGHT matrix 
            gray_matrix = new Array();
            for (var i = 0; i < WIDTH*HEIGHT; i+= WIDTH) {
                gray_matrix.push(gray.slice(i, i+WIDTH))
            }

            // Downscale the matrix into a DIM*DIM matrix
            small_matrix = new Array();
            for (var i = 0; i < HEIGHT; i+= SCALE) {
                var row = new Array();
                for (var j = 0; j < WIDTH; j+= SCALE) {
                    var tmp = 0;
                    for (var m = i; m < i+SCALE; m++) {
                        for (var n = j; n < j+SCALE; n++) {
                            tmp += gray_matrix[m][n];
                        }
                    }
                    row.push(tmp/(SCALE*SCALE));
                }
                small_matrix.push(row);
            }

            // Flatten matrix
            var nodes = [].concat.apply([], small_matrix)

            nn = new Network();
            var output = nn.feedforward(nodes);

            var i = output.indexOf(Math.max.apply(Math, output));
            console.log(output);
            console.log(i);

        }, false);
    };


})();
