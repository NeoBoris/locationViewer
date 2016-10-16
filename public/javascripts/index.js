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

    // User情報の取得
    $scope.userInfos = [];
    var User = ncmb.DataStore("User");
    User.fetchAll().then(function(results) {
        for (var i = 0; i < results.length; i++) {
            $scope.userInfos.push({user: results[i], locations: null});
            $scope.userInfos[i].style = {
                "background-color" : 'rgb(' + results[i].R + ',' + results[i].G + ',' + results[i].B + ')',
                "text-align" : "center"
            };
            $scope.userInfos[i].areaName = "-";
        }
    });

    // Area情報の取得
    $scope.areas = [];
    var Area = ncmb.DataStore("Area");
    Area.fetchAll().then(function(results) {
        var areas = [];
        for (var i = 0; i < results.length; i++) {
            areas.push({
                x:Number(results[i].x),
                y:Number(results[i].y),
                width:Number(results[i].width),
                height:Number(results[i].height),
                name: results[i].name
            });
        }
        $scope.areas = areas;
    });

    var t = $interval(function() {
        if (layer2.getContext) {
            for (var i = 0; i < $scope.userInfos.length; i++) {
                getLocation(i);
            }
        }
    }, 1000);
    var t_draw = $interval(function() {
        if (layer2.getContext) {
            var ctx = layer2.getContext('2d');
            ctx.clearRect(0, 0, iwidth, iheight);
            for (var i = 0; i < $scope.userInfos.length; i++) {
                var locations = $scope.userInfos[i].locations;
                if (locations !== null) {
                    var user = $scope.userInfos[i].user;
                    var num = 5;
                    var alpharatio = 1.0 / (num + 1);
                    for (var j = 0; j < num; j++) {
                        if (locations.length <= j) { break; }
                        var x = locations[j].x;
                        var y = locations[j].y;
                        ratiox = x * ratiowidth;
                        ratioy = y * ratioheight;
                        ctx.fillStyle = 'rgba(' + user.R + ',' + user.G + ',' + user.B + ',' + (1.0 - alpharatio * j) + ')';
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

    var getLocation = function(userIdx) {
        var Location = ncmb.DataStore("Location");
        Location.limit(5).equalTo("uuid", $scope.userInfos[userIdx].user.uuid).order("createDate", true).fetchAll().then(function(results) {
            var locations = [];
            for (var i = 0; i < results.length; i++) {
                locations.push({x: Number(results[i].x), y: Number(results[i].y)});
            }
            $scope.userInfos[userIdx].locations = locations;
            checkWhereInArea(userIdx);
        }).catch(function(err) {
            $scope.err = err;
        });
    };

    var checkWhereInArea = function(userIdx) {
        var locations = $scope.userInfos[userIdx].locations;
        if (locations.length <= 0) { return; }
        for (var i = 0; i < $scope.areas.length; i++) {
            var area = $scope.areas[i];
            var location = $scope.userInfos[userIdx].locations[0];
            if (area.x <= location.x && location.x <= area.x + area.width && area.y <= location.y && location.y <= area.x + area.height) {
                $scope.userInfos[userIdx].areaName = area.name;
                return;
            }
        }
        $scope.userInfos[i].areaName = "-";
    };

    $scope.onStopUpdateLocation = function() {
        $interval.cancel(t);
        $interval.cancel(t_draw);
    };
}]);