function Service($timeout){
    "ngInject";
    this.timeout = $timeout;
};

Service.protype.closeSuccessAlert = function(caller){
	caller.success = "";
};

module.exports = angular.module('app.models.error', [
    'app.settings'
]).service('ErrorService', Service);
