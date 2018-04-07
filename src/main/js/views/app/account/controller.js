
function Controller($scope, $state, UserService){
    "ngInject";
    this._$scope = $scope;
    this._$state = $state;
    this._$scope.pageName = "Account";
    this._UserService = UserService;
    this.newPassword = {};
    this.changeSuccess = false;
    this.init();
};

Controller.prototype.init = function(){
    var self = this;
    self.getAccount();
}

Controller.prototype.getAccount = function(){
    var self = this;
    self.user = self._UserService.getAccount();
};

module.exports = angular.module('app.views.app.account.controller', [])
.controller('AccountCtrl', Controller);
