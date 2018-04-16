function Service(){
    "ngInject";

};

Service.prototype.closeSuccessAlert = function(){
	success = "";
};

module.exports = angular.module('app.models.error', [
    'app.settings'
]).service('ErrorService', Service);
