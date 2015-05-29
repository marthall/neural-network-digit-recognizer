
var BOUNDING_BOX_SIZE = 20;
var IMAGE_SIZE = 28;

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
    
    var borders = DrawCanvas.normalizeBoundingBox(this.getBoundingBox());

    var height = borders.maxY - borders.minY;
    var width = borders.maxX - borders.minX;
    
    var clippedImageData = this.context.getImageData(
        borders.minX,
        borders.minY,
        width,
        height);
    
    // Array of all gray values
    var grey = DrawCanvas.getGreyDataFromImageData(clippedImageData);

    var size = Math.max(height, width);

    // Matrix of the gray values
    var greyMatrix = DrawCanvas.getMatrixFromArray(grey, width);

    var scaled = DrawCanvas.downScale(greyMatrix, Math.floor(size / BOUNDING_BOX_SIZE));

    // Center of mass within the clipped image;
    var center = DrawCanvas.calculateCenterOfMass(scaled, 0.5);

    var padding = DrawCanvas.getPadding(center);

    var finalMatrix = DrawCanvas.addPadding(scaled, padding);

    // Flatten matrix
    var nodes = [].concat.apply([], finalMatrix);

    return nodes;
};

DrawCanvas.prototype.clear = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

DrawCanvas.getGreyDataFromImageData = function (imageData) {
    // Turns rgba values into single grey values
    // g = avg(r, g, b) * a
    // rgb values [0-255] are converted to grey values [0-1], where 1 is black
    var image = imageData.data;

    var grey = new Array();
    for (var i = 0; i < image.length / 4; i++) {
        var g = (1 - (image[i*4]/255 + image[i*4+1]/255 + image[i*4+2]/255) / 3) * (image[i*4+3] / 255);
        grey[i] = g;
    }

    return grey;
};

DrawCanvas.getMatrixFromArray = function (array, width) {
    var matrix = new Array();

    for (var i = 0; i < array.length; i += width) {
        matrix.push(array.slice(i, i + width));
    }

    return matrix;
};

DrawCanvas.downScale = function (greyMatrix, scale) {
    // Takes a matrix of grey values and calculates the sum of the included pixels.

    var smallMatrix = new Array();

    for (var i = 0; i < greyMatrix.length; i+= scale) {
        var row = new Array();
        for (var j = 0; j < greyMatrix[i].length; j+= scale) {
            var tmp = 0;
            for (var m = i; m < i+scale; m++) {
                for (var n = j; n < j+scale; n++) {
                    tmp += greyMatrix[m][n];
                }
            }
            row.push(tmp/(scale*scale));
        }
        smallMatrix.push(row);
    }

    return smallMatrix;
};

DrawCanvas.calculateCenterOfMass = function(matrix, threshold) {
    // Calculates the center of mass of an matrix
    // Sets a threshold for simplicity, so that all pixels has uniform weight
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
};

DrawCanvas.getPadding = function(center) {
    // Calculate padding to center the centerOfMass of 20x20 in the middle of the 28x28 image
    var padding = {
        top: BOUNDING_BOX_SIZE / 2 - center.y + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
        bottom: center.y - BOUNDING_BOX_SIZE / 2 + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
        left: BOUNDING_BOX_SIZE / 2 - center.x + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2,
        right: center.x - BOUNDING_BOX_SIZE / 2 + (IMAGE_SIZE - BOUNDING_BOX_SIZE)/2
    }

    return padding;
}

DrawCanvas.addPadding = function(matrix, padding) {
    // Takes a matrix and padding = {top, bottom, right, left} and adds the padding
    // to the matrix

    var paddedMatrix = new Array();
    // Add top padding
    for (var i = 0; i < padding.top; i++) {
        paddedMatrix.push(Array.apply(null,
            new Array(matrix[0].length + padding.left + padding.right))
        .map(Number.prototype.valueOf,0));
    }

    // Add horizontal padding
    for (var i = 0; i < matrix.length; i++) {
        var row = new Array();

        // Left
        for (var j = 0; j < padding.left; j++) {
            row.push(0);
        }

        // Actual values
        for (var j = 0; j < matrix[i].length; j++) {
            row.push(matrix[i][j]);
        }

        // Right
        for (var j = 0; j < padding.right; j++) {
            row.push(0);
        }

        paddedMatrix.push(row);
    }

    // Bottom
    for (var i = 0; i < padding.bottom; i++) {
        paddedMatrix.push(Array.apply(null,
            new Array(matrix[0].length + padding.left + padding.right))
        .map(Number.prototype.valueOf,0));
    }

    return paddedMatrix;
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

DrawCanvas.normalizeBoundingBox = function (borders) {
    // Returns new borders where width = height and size is multiple of BOUNDING_BOX_SIZE

    var width = borders.maxX - borders.minX;
    var height = borders.maxY - borders.minY;

    var midX = borders.minX + width / 2;
    var midY = borders.minY + height / 2;

    var size = Math.max(width, height);
    var offset = BOUNDING_BOX_SIZE - (size % BOUNDING_BOX_SIZE);

    var newBorders = {};

    newBorders.minX = Math.round(midX - (size / 2) - (offset / 2));
    newBorders.maxX = Math.round(midX + (size / 2) + (offset / 2));
    newBorders.minY = Math.round(midY - (size / 2) - (offset / 2));
    newBorders.maxY = Math.round(midY + (size / 2) + (offset / 2));

    return newBorders
};
