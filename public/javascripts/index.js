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
    var users = null;
    {
        var User = ncmb.DataStore("User");
        User.fetchAll().then(function(results) {
            users = results;
        });
    }
    $scope.toilet = false;
    var t = $interval(function() {
        if (users === null) { return; }
        for (var u = 0; u < users.length; u++) {
            mapping(u)
        }
    }, 1000);
    var mapping = function(u) {
        var Location = ncmb.DataStore("Location");
        Location.limit(5).equalTo("uuid", users[u].uuid).order("createDate", true).fetchAll().then(function(results) {
            var r = users[u].R;
            var g = users[u].G;
            var b = users[u].B;
            $scope.x = results[0].x;
            $scope.y = results[0].y;
            if (layer2.getContext) {
                var ctx = layer2.getContext('2d');
                ctx.clearRect(0, 0, iwidth, iheight);
                var num = 5;
                var alpharatio = 1.0 / (num + 1);
                for (var i = 0; i < num; i++) {
                    if (results.length <= i) {
                        break;
                    }
                    var x = results[i].x;
                    var y = results[i].y;
                    ratiox = x * ratiowidth;
                    ratioy = y * ratioheight;
                    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (1.0 - alpharatio * i) + ')';
                    ctx.beginPath();
                    ctx.arc(ratiox, ratioy, (num + 2 - i), 0, Math.PI * 2, true);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
                    ctx.fillText(users[u].char, ratiox - 3, ratioy + 3);
                }
            }
        }).catch(function(err) {
            $scope.err = err;
        });
    };

    $scope.onclick = function() {
        $interval.cancel(t);
    };
}]);