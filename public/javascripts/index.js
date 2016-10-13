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
    img.src = "../images/room.png?" + new Date().getTime();
    var ratiowidth = 1.0;
    var ratioheight = 1.0;
    var iwidth = 900;
    var iheight = 600;
    img.onload = function() {
        if (layer1.getContext) {
            var ctx = layer1.getContext('2d');
            ratiowidth = iwidth / img.width;
            ratioheight = iheight / img.height;
            ctx.drawImage(img, 0, 0, iwidth, iheight);
        }
    };
    var mappingInfos = [];
    {
        var User = ncmb.DataStore("User");
        User.fetchAll().then(function(results) {
            for (var i = 0; i < results.length; i++) {
                mappingInfos.push({user: results[i], locations: null});
            }
        });
    }
    $scope.toilet = false;
    var t = $interval(function() {
        if (layer2.getContext) {
            for (var i = 0; i < mappingInfos.length; i++) {
                getLocation(i);
            }
        }
    }, 1000);
    var t_draw = $interval(function() {
        if (layer2.getContext) {
            var ctx = layer2.getContext('2d');
            ctx.clearRect(0, 0, iwidth, iheight);
            for (var i = 0; i < mappingInfos.length; i++) {
                var locations = mappingInfos[i].locations;
                if (locations !== null) {
                    var user = mappingInfos[i].user;
                    var r = user.R;
                    var g = user.G;
                    var b = user.B;
                    var num = 5;
                    var alpharatio = 1.0 / (num + 1);
                    for (var j = 0; j < num; j++) {
                        if (locations.length <= j) { break; }
                        var x = locations[j].x;
                        var y = locations[j].y;
                        ratiox = x * ratiowidth;
                        ratioy = y * ratioheight;
                        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (1.0 - alpharatio * j) + ')';
                        ctx.beginPath();
                        ctx.arc(ratiox, ratioy, (num + 2 - j), 0, Math.PI * 2, true);
                        ctx.fill();
                        if (j === 0) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
                            ctx.fillText(user.char, ratiox - 3, ratioy + 3);
                        }
                    }
                }
            }
        }
    });
    var getLocation = function(i) {
        var Location = ncmb.DataStore("Location");
        Location.limit(5).equalTo("uuid", mappingInfos[i].user.uuid).order("createDate", true).fetchAll().then(function(results) {
            mappingInfos[i].locations = results;
        }).catch(function(err) {
            $scope.err = err;
        });
    };

    $scope.onclick = function() {
        $interval.cancel(t);
        $interval.cancel(t_draw);
    };
}]);