function Service(){
    "ngInject";
};

Service.prototype.closeErrorAlert = function(caller){
	caller.error = "";
};

Service.prototype.closeSuccessAlert = function(caller){
	caller.success = "";
};

module.exports = angular.module('app.models.alert', [
    'app.settings'
]).service('AlertService', Service);
