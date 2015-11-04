function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
};

function dotproduct(a,b) {
    var n = 0, lim = Math.min(a.length,b.length);
    for (var i = 0; i < lim; i++) n += a[i] * b[i];
    return n;
};

function sigmoid(z) {
    return 1/(1+Math.exp(-z))
};

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
};
