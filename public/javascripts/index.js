var app = angular.module('location_viewer', [])
.run(['$window', function($window) {
    console.log("aaa");
}]);

app.controller('MainController', ['$scope', '$interval', function($scope, $interval){
    var ncmb = new NCMB("APP_KEY",
                        "CLIENT_KEY");
    var layer1 = document.getElementById("layer1");
    var layer2 = document.getElementById("layer2");
    var img = new Image();
    img.src = "../images/room.jpg?" + new Date().getTime();
    var ratiowidth = 1.0;
    var ratioheight = 1.0;
    img.onload = function() {
        if (layer1.getContext) {
            var ctx = layer1.getContext('2d');
            ratiowidth = 300 / img.width;
            ratioheight = 400 / img.height;
            ctx.drawImage(img, 0, 0, 300, 400);
        }
    };
    $scope.toilet = false;
    var t = $interval(function() {
        var Location = ncmb.DataStore("Location");
        Location.limit(5).order("createDate", true).fetchAll().then(function(results) {
            $scope.x = results[0].x;
            $scope.y = results[0].y;
            if (layer2.getContext) {
                var ctx = layer2.getContext('2d');
                ctx.clearRect(0, 0, 300, 400);
                var num = 5;
                var alpharatio = 1.0 / (num + 1);
                for (var i = 0; i < num; i++) {
                    if (results.length <= i) {
                        break;
                    }
                    var x = results[i].x;
                    var y = results[i].y;
                    if (i === 0) {
                        if (81 < x && x < 184 && 253 < y && y < 295) {
                            $scope.toilet = true;
                        } else {
                            $scope.toilet = false;
                        }
                    }
                    circlex = x * ratiowidth;
                    circley = y * ratioheight;
                    ctx.fillStyle = 'rgba(0, 141, 203, ' + (1.0 - alpharatio * i) + ')';
                    ctx.beginPath();
                    ctx.arc(circlex, circley, (num + 2 - i), 0, Math.PI * 2, true);
                    ctx.fill();
                }
                /*
                ctx.fillRect(circlex - 5, circley - 5, 10, 10);
                */
            }
        }).catch(function(err) {
            $scope.err = err;
        });
    }, 1000);

    $scope.onclick = function() {
        $interval.cancel(t);
    };
}]);