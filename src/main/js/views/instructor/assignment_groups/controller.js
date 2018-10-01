
function Controller($scope, $state, $stateParams, GroupService, AssignmentService){
    "ngInject";
    this._$state = $state;
    this.pageName = "Assignment Groups";
    this._GroupService = GroupService;
    this._AssignmentService= AssignmentService;
    this.courseId = $stateParams.courseId;
    this.moduleId = $stateParams.moduleId;
    this.groups = {};
    this.init();

};

Controller.prototype.init = function(){
    var self = this;
    //Get Assignment Groups for grading
    self.getAssignmentGroups();
}

Controller.prototype.getAssignmentGroups = function() {
    var self = this;
    self._GroupService.getAssignmentGroups(self.courseId, self.moduleId)
        .then(function(payload){
            for(var g in payload) {
            	self.groups[g] = { members: payload[g] };
        	}
            self.getAssignmentGrades();
    }, function(err){
       self.error = "ERROR getting the assignment groups";
    });
};

Controller.prototype.getAssignmentGrades = function() {
    var self = this;
    self._GroupService.getAssignmentGrades(self.courseId, self.moduleId)
        .then(function(payload){
        	for(var g in payload) {
            	self.groups[g].grade = payload[g];
        	}
    }, function(err){
       self.error = "ERROR getting the assignment groups";
    });
};

Controller.prototype.navToQuestions = function(groupId){
    var self = this;
    self._$state.go('app.course.assignment.questions',{ viewOnly: true, groupId:groupId, grading:true });
}

module.exports = angular.module('app.views.instructor.assignment.groups', [])
.controller('Instructor.AssignmentGroups', Controller);
