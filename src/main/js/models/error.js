function Service($timeout){
    "ngInject";
    this.timeout = $timeout;
};

Service.prototype.showError = function(caller, err, time) {
	time = time || 5000;
	var self = this;
	caller.error = err;
    self.timeout(function() { caller.error = ""; }, time);
};

module.exports = angular.module('app.models.error', [
    'app.settings'
]).service('ErrorService', Service);
