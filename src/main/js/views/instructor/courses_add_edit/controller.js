
function Controller($scope, $state, course, CourseService, ErrorService){
    "ngInject";
    this._$state = $state;
    this.pageName = "Add/Edit Course";
    this.cloneAllowed = false;
    this.course = course;
    this.allCourses = [];
    this._CourseService = CourseService;
    this._ErrorService = ErrorService;
    this.today = new Date();
    this.init();
};

Controller.prototype.init = function(){
    var self = this;
    //Allow cloning of course only if we are creating a new course
    if(!self.course){
        self.cloneAllowed = true;
        self.getAllPossibleToCloneCourses();
    }
}

Controller.prototype.addCourse= function(valid, course) {
    var self = this;
    if(valid){
    	if(!self.course.id){
	        self.error = null;
	        self._CourseService.addCourse(course)
	            .then(function(payload){
	                self._$state.go('app.courses', { created_updated : true });
	        }, function(err){
	        	self._ErrorService.showError(self, "ERROR creating the course");
	           //self.error = "ERROR creating the course";
	        });
    	} else {
	        self.error = null;
	        self._CourseService.editCourse(course.id, course)
	            .then(function(payload){
	                self._$state.go('app.courses', { created_updated : true });
	        }, function(err){
	           self._ErrorService.showError(self, "ERROR updating the course");
	        });
    	}
    }
};

Controller.prototype.getAllPossibleToCloneCourses = function(){
    var self = this;
    self._CourseService.getAllInstructorCourses()
        .then(function(payload){
            self.allCourses = payload;
    }, function(err){
       self.error = err;
    });
}

Controller.prototype.closeDatePicker = function() {
	var self = this;
    self.closeDatePickOpen = true;
};

Controller.prototype.openDatePicker = function() {
	var self = this;
    self.openDatePickOpen = true;
};

Controller.prototype.closeErrorAlert = function(){
	self = this;
	self.error = false;
};

module.exports = angular.module('app.views.instructor.courses.add_edit', [])
.controller('Instructor.CoursesAddEdit', Controller);
