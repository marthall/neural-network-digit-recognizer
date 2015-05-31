var ChartCanvas = function(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');
    this.context.font = "18px serif";
}

// Array on form [(num, confidence), (num, confidence), (num, confidence), ...]
ChartCanvas.prototype.draw = function(array) {
    var bar = {
        height: 20,
        padding: 5,
        maxWidth: 180
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < array.length; i++) {
        this.context.fillStyle = "#333";
        this.context.fillText(array[i][0], 8, 25 + (i * (bar.height + bar.padding)))
        this.context.fillStyle = "#88f";
        this.context.fillRect(24, 10 + (i * (bar.height + bar.padding)), bar.maxWidth * array[i][1], bar.height);
    }
};

ChartCanvas.prototype.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

