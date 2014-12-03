/*
    app.js, main Angular application script
    define your module and controllers here
*/

"use strict";

var reviewUrl = 'https://api.parse.com/1/classes/reviews';

var rated = false;
angular.module('ReviewApp', ['ui.bootstrap'])
    .config(function($httpProvider){
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'p9uK4CiI4mARDs4GlSi6v4HxKtpr2EDsJXDfymGR';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'EhkIN0CxuLCNeajt3NABkmYM0g9OLINZKqVI0O2w';
    })
    
    .controller('CommentController', function($scope, $http) {
        
        $scope.refreshComments = function() {
            $http.get(reviewUrl + '?where={"done":false}') //GET
                .success(function (data){
                    $scope.comments = data.results;
                });
        };

        $scope.refreshComments();
        $scope.newComment = {done: false};
        
        $scope.addComment = function() { //POST
            $scope.refreshComments();
            if(rated) {
                $scope.inserting = true;
                $http.post(reviewUrl, $scope.newComment)
                    .success(function(responseData) {
                        $scope.newComment.objectId = responseData.objectId;
                        $scope.comments.push($scope.newComment);
                        $scope.newComment = {done: false};
                        $scope.valid = true;
                    })
                    .finally(function() {
                        $scope.inserting = false;
                    });
            }             
        };
        
        $scope.rated = function() {
            rated = true;
        }
        $scope.updateComment = function(comment) {
            $http.put(reviewUrl + '/' + comment.objectId, comment) 
        };

        $scope.incrementVotes = function(comment, value) { //PUT
            var postData = {
                votes: {
                    __op: "Increment",
                    amount: value
                }
            };
            if(comment.votes + value != -1) {
                $scope.updating = true;
                $http.put(reviewUrl + '/' + comment.objectId, postData)
                    .success(function(respData) {
                        comment.votes = respData.votes;
                    })
                    .error(function(err) {
                        console.log(err);
                    })
                    .finally(function() {
                        $scope.updating = false;
                    });
            }
        };
    
        $scope.removeComment = function(comment) { //DELETE
            comment.done = true;
            $http.delete(reviewUrl + '/' + comment.objectId);
            var timeoutCode;
            var delayInMs = 1000;
            timeoutCode = setTimeout(function(){
                $scope.refreshComments();
            },delayInMs);
            
        };
    });