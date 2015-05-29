
var BoundingBoxCanvas = function(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 400
    this.canvas.height = 400;
    
    this.context.lineWidth = 1;
    this.context.strokeStyle = "rgba(255, 100, 100, 0.5)";
    this.context.shadowBlur = 0;
    this.context.setLineDash([2,3]);
};

BoundingBoxCanvas.prototype.update = function(borders) {
    this.clear();
    this.context.strokeRect(
        borders.minX,
        borders.minY,
        borders.maxX - borders.minX,
        borders.maxY - borders.minY);

    // var normalizedBorders = DrawCanvas.normalizeBoundingBox(borders);
    // this.context.strokeRect(
    //     normalizedBorders.minX,
    //     normalizedBorders.minY,
    //     normalizedBorders.maxX - normalizedBorders.minX,
    //     normalizedBorders.maxY - normalizedBorders.minY);
};

BoundingBoxCanvas.prototype.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}