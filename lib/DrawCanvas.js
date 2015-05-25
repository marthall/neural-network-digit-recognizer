var DrawCanvas = function(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 400
    this.canvas.height = 400;
    
    this.context.lineWidth = 14;
    this.context.lineJoin = this.context.lineCap = 'round';
    this.context.shadowBlur = 5;
    this.context.shadowColor = 'rgb(40, 40, 40)';

    pencil = new pencil();

    // Attach the mousedown, mousemove and mouseup event listeners
    this.canvas.addEventListener('mousedown', draw_event, false);
    this.canvas.addEventListener('mousemove', draw_event, false);
    this.canvas.addEventListener('mouseup',   draw_event, false);

    parent = this;
    function pencil () {
        self = this;
        self.active = false;

        this.mousedown = function (event) {
            parent.context.beginPath();
            parent.context.moveTo(event._x, event._y);
            self.active = true;
        };

        this.mousemove = function (event) {
            if (self.active) {
                parent.context.lineTo(event._x, event._y);
                parent.context.stroke();
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
};

DrawCanvas.prototype.getInputNodes = function () {

};

DrawCanvas.prototype.clear = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

DrawCanvas.getGrayDataFromImageData = function (imageData) {
    // Turns rgba values into single gray values
    // g = avg(r, g, b) * a
    // rgb values [0-255] are converted to gray values [0-1], where 1 is black
    var gray = new Array();

    for (var i = 0; i < imageData.length; i++) {
        gray[i] = (1 - (image[i*4]/255 + image[i*4+1]/255 + image[i*4+2]/255) / 3) * (image[i*4+3] / 255);
    }

    return gray;
};

DrawCanvas.getMatrixFromArray = function (array, width) {
    var matrix = new Array();

    for (var i = 0; i < array.length; i += width) {
        matrix.push(array.slice(i, i + width));
    }

    return matrix;
};

DrawCanvas.prototype.getBoundingBox = function() {

    var image = this.context.getImageData(0, 0, this.canvas.height, this.canvas.width);
    var borders = {};
    
    // Iterate through alpha values and set border if alpha > 0
    minY:
    for (var i = 3; i < image.data.length; i += 4) {
        if (image.data[i] > 0) {
            borders.minY = Math.floor(i / (4 * image.width));
            break minY;
        }
    }

    // If minY is undefined, then image is blank
    if (borders.minY == undefined) {
        return undefined;
    }

    maxY:
    for (var i = image.data.length - 1; i >= 3; i -= 4) {
        if (image.data[i] > 0) {
            borders.maxY = Math.ceil(i / (4 * image.width));
            break maxY;
        }
    }

    minX:
    // TODO: Do not check previous checked pixels again
    for (var column = 0; column < image.width * 4; column ++) {
        for (var row = 0; row < image.height; row++) {
            var index = row * image.width * 4 + column * 4 + 3;
            if (image.data[index] > 0) {
                borders.minX = column;
                break minX;
            }
        }
    }

    maxX:
    for (var column = image.width - 1; column > 0; column--) {
        for (var row = 0; row < image.height; row++) {
            var index = row * image.width * 4 + column * 4 + 3;
            if (image.data[index] > 0) {
                borders.maxX = column;
                break maxX;
            }
        }
    }

    return borders;

};
