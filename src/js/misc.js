;(function() {

    window.onload = function() {
        drawCanvas = new DrawCanvas("drawsurface");
        chartCanvas = new ChartCanvas("chart");
        boundingBoxCanvas = new BoundingBoxCanvas("bounding-box")
        classification = document.getElementById("classification");
        updateEvent = new CustomEvent('updateEvent')
        
        nn = new Network();

    };

    window.onkeyup = function(event) {
        var key = event.keyCode ? event.keyCode : event.which;
        if (key = 99) clear();
    };

    document.getElementById('clear').addEventListener('click', clear, false);

    function clear() {
        drawCanvas.clear();
        chartCanvas.clear();
        boundingBoxCanvas.clear();
        classification.innerHTML = "";
    };

    document.addEventListener('updateEvent', function(e) {

        var nodes = drawCanvas.getInputNodes();
        var output = nn.feedforward(nodes);
        var indexes = [0,1,2,3,4,5,6,7,8,9]

        var indexedOutput = zip([indexes, output]).sort(function(a, b) { return b[1] - a[1]});

        classification.innerHTML = indexedOutput[0][0];

        chartCanvas.draw([indexedOutput[0], indexedOutput[1], indexedOutput[2]]);

        boundingBoxCanvas.update(drawCanvas.getBoundingBox());

    }, false);


})();
