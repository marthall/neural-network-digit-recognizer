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

DrawCanvas.getBoundingBox = function(image) {
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

    return {
        minY: minY,
        minX: minX,
        maxY: maxY,
        maxX: maxX
    }
};
