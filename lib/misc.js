;(function() {

    window.onload = function() {
        var drawCanvas = new DrawCanvas("drawsurface");
        var chartCanvas = new ChartCanvas("chart");
        var classification = document.getElementById("classification");
        updateEvent = new CustomEvent('updateEvent')
        
        nn = new Network();

    };

    document.getElementById('clear').addEventListener('click', function() {
        drawCanvas.clear();
        chartCanvas.clear();
        classification.innerHTML = "";
    }, false);

    document.addEventListener('updateEvent', function(e) {

        var nodes = drawCanvas.getInputNodes();
        var output = nn.feedforward(nodes);
        var indexes = [0,1,2,3,4,5,6,7,8,9]

        var indexedOutput = zip([indexes, output]).sort(function(a, b) { return b[1] - a[1]});

        classification.innerHTML = indexedOutput[0][0];

        chartCanvas.draw([indexedOutput[0], indexedOutput[1], indexedOutput[2]]);

    }, false);


})();
