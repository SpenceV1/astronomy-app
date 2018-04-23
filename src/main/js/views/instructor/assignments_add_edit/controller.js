
function Controller($scope, $state, $stateParams, $timeout, assignment, AssignmentService, AlertService){
    "ngInject";
    this._$state = $state;
    this.pageName = "Add Assignment";
    this.courseId = $stateParams.courseId;
    this.moduleId = $stateParams.moduleId;
    this.isNew = $stateParams.isNew;
    this._$stateParams  = $stateParams;
    this._AssignmentService = AssignmentService;
    this.assignment = assignment;
    this._$timeout = $timeout;
    this._AlertService = AlertService;
    this.init();

};

Controller.prototype.init = function(){
    var self = this;
}

Controller.prototype.add_eidtAssignment = function(valid, assignment){
    var self = this;
    self.error = null;
    var service = null;
    if(valid){
        if(self.isNew == true){
            service = self._AssignmentService.addAssignment(self.courseId, assignment);
            service.then(function(payload){
                self._$state.go('app.course.assignments', { courseId : self.courseId, success : "Assignment Successfully Created!" });
            }, function(err){
                self.error = "ERROR: trying to create assignment";
            })
        } else if(self.isNew == false) {
            service = self._AssignmentService.editAssignment(self.courseId, self.moduleId, assignment);
            service.then(function(payload){
                self._$state.go('app.course.assignments', { courseId : self.courseId, success : "Assignment Edited Successfully!" });
            }, function(err){
                self.error = "ERROR: trying to edit assignment";
            })
        }
    }
}

Controller.prototype.closeDatePicker = function() {
	var self = this;
    self.closeDatePickOpen = true;
};

Controller.prototype.openDatePicker = function() {
	var self = this;
    self.openDatePickOpen = true;
};

module.exports = angular.module('app.views.instructor.assignments.add_edit', [])
.controller('Instructor.AssignmentsAddEdit', Controller);
