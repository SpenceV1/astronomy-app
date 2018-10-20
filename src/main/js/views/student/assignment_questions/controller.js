
function Controller($scope, $state, $stateParams, AssignmentService, QuestionService, appSettings, ConfirmationService, GroupService){
    "ngInject";
    this.pageName = "Questions";
    this.maxPage = 1;
    this.minPage = 1;
    this.currentPage = 1;
    this.editable = false;
    this.lastSaved = "Not Saved";
    this.showSaved = true;
    this.pages = [];
    this._$state = $state;
    this._$scope = $scope;
    this._appSettings = appSettings;
    this.courseId = $stateParams.courseId;
    this.moduleId = $stateParams.moduleId;
    this.groupId = $stateParams.groupId;
    this.grading = $stateParams.grading;
    this.viewOnly = $stateParams.viewOnly;
    this.data = {};
    this.questionGrades = {};
    this.questions = [];
    this.gateKeepers = [];
    this.savedAnswers = {};
    this._AssignmentService = AssignmentService;
    this._GroupService = GroupService;
    this._QuestionService = QuestionService;
    this._ConfirmationService = ConfirmationService;
    this.gateLocked = [];
    this.temp = [];
    this.init();
};

Controller.prototype.init = function(){
    var self = this;
    self._$scope.assignmentService = self._AssignmentService;
    self._$scope.$watch('assignmentService.assignmentDetails', function(newAssignmentDetails){
       if(newAssignmentDetails){
           self.maxPage = newAssignmentDetails.numPages;
           self.pages = new Array(self.maxPage);
       }
    });
    
    self.getShowSaved();
    self.getQuestions(self.currentPage);
    if(!self.viewOnly) {
    	self.getGatekeepers();
    }
};

Controller.prototype.getLock = function(page){
    var self = this;
    if(self.viewOnly || self.grading){
        self.editable = false;
    } 
    else if(!self.viewOnly){
    	self.editable = true;
    }else {
        self._GroupService.getLock(self.courseId, self.moduleId, self.groupId, page)
                .then(function(payload){
                if(payload.hasLock && payload.isModuleEditable){
                    self.editable = true;
                } else {
                    self.editable = false;
                }
        }, function(err){
            self.editable = false;
            self.error = "ERROR getting the lock";
        });
    }
};

Controller.prototype.getShowSaved = function(){
    var self = this;
    self._AssignmentService.getAssignmentDetails(self.courseId, self.moduleId)
        .then(function(payload){
            var currentDate = new Date();
            if(currentDate > payload.closeTimestamp){
                self.showSaved = false;
            } else {
                self.showSaved = true;
            }
            //Get the answers
            self.getAnswers();
    }, function(err){
       self.error = "ERROR getting Assignment Details";
    });
};

//Get Questions for the assignment
Controller.prototype.getQuestions = function(newPage){
    var self = this;
    self._QuestionService.getQuestions(self.courseId, self.moduleId, newPage)
        .then(function(payload){
            self.data = {};
            self.questions = payload;
            self.currentPage = newPage;
            self.lastSaved = "Not Saved";
            self.getLock(newPage);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
    }, function(err){
       self.error = "ERROR getting the questions";
    });
};

Controller.prototype.getGatekeepers = function(){
    var self = this;
    self._QuestionService.getGatekeepers(self.courseId, self.moduleId, self.groupId)
        .then(function(payload){
            self.data = {};
            var gatekeepers = [];
            for(var i = 0; i < payload.length; i++) {
            	var pageNum = payload[i][0];
                var questionId = payload[i][1];
    	    	var isCorrect = payload[i][2];
            	gatekeepers[i] = {
            			id: questionId,
            			page: pageNum,
            			correct: isCorrect
            	};
            }
            self.gatekeepers = gatekeepers;
            self.updateGatekeeperLocks();
    }, function(err){
       self.error = "ERROR getting GateKeepers";
    });
};

Controller.prototype.updateQuestions = function(newPage){
    var self = this;
    self._QuestionService.getQuestions(self.courseId, self.moduleId, newPage)
        .then(function(payload){
            self.data = {};
            self.questions = payload;
            self.currentPage = newPage;
    }, function(err){
       self.error = "ERROR getting the questions";
    });
};

Controller.prototype.updateGatekeeperLocks = function() {
	var self = this;
    for(var i = 0; i < self.maxPage; i++)
	{
		self.gateLocked[i] = false;
	}
	if(self.gatekeepers.length > 0 && !self.viewOnly)
	{
		var gatekeepers = self.gatekeepers;
	    for(var i = 0; i < gatekeepers.length; i++) {
	    	if(!gatekeepers[i].correct) {
	    		for(var k = gatekeepers[i].page; k < self.maxPage; k++)
    			{
		    		self.gateLocked[k] = true;
    			}
	    	}
	    }
	}
};

Controller.prototype.saveAnswers = function(newPage){
    var self = this;
    self.lastSaved = "Saving...";
    self._QuestionService.saveAnswers(self.courseId, self.moduleId, self.groupId, self.data)
        .then(function(payload){
            self.savedAnswers = payload;
            self.lastSaved = new Date();
            for(var i = 0; i < self.questions.length; i++)
        	{
            	var totalPoints = self.questions[i].points;
            	if(self.questions[i].unitPoints != undefined) {
            		totalPoints += self.questions[i].unitPoints;
            	}
            	var correct = false;
        		if(self.questions[i].isGatekeeper && self.savedAnswers[self.questions[i].id] != undefined && self.savedAnswers[self.questions[i].id].pointsEarned == totalPoints) {
        			correct = true;
        		} else {
        			correct = false;
        		}
        		
        		var question = self.gatekeepers.find(function(element) {
        			  return element.id == self.questions[i].id;
        			});
        		if(question != undefined) {
        			question.correct = correct;
	        		self.temp.push(question.id + ": " + question.correct);
        		}
        	}
            self.updateGatekeeperLocks();
    }, function(err){
       self.error = "ERROR saving the answers";
    });
};

Controller.prototype.savePoints = function(){
    var self = this;
    self.lastSaved = "Saving...";
    self._QuestionService.savePoints(self.courseId, self.moduleId, self.groupId, self.questionGrades)
        .then(function(payload){
            self.savedAnswers = payload;
            self.lastSaved = new Date();
    }, function(err){
       self.error = "ERROR saving points";
    });
};

Controller.prototype.getAnswers = function(newPage){
    var self = this;
    self._QuestionService.getAnswers(self.courseId, self.moduleId, self.groupId, self.showSaved)
        .then(function(payload){
            self.savedAnswers = payload;
    }, function(err){
    	if(self.groupId != "") {
    		self.error = "ERROR getting the answers";
    	}
    });
};

Controller.prototype.doneGrading = function() {
    var self = this;
    self.lastSaved = "Saving...";
    self._QuestionService.savePoints(self.courseId, self.moduleId, self.groupId, self.questionGrades)
        .then(function(payload){
            self.savedAnswers = payload;
            self.lastSaved = new Date();
            self._$state.go('app.course.assignment.groups', { moduleId: self.moduleId }, { reload:true });
    }, function(err){
       self.error = "ERROR saving points";
    });
};

Controller.prototype.submit = function(){
    var self = this;
    var confirmation = "Are you sure you want to submit?";
    var footNote = "Please make sure you save before you submit!";
    var modalInstance = self._ConfirmationService.open("", confirmation, footNote);
    self.saveAnswers(self.currentPage);
    modalInstance.result.then(function(){
	    	self._QuestionService.saveAnswers(self.courseId, self.moduleId, self.groupId, self.data)
	        .then(function(payload){
	            self.savedAnswers = payload;
	            self.lastSaved = new Date();
	            self._$state.go('app.course.assignment', { moduleId: self.moduleId, submitted: true }, { reload:true });
	    }, function(err){
	       self.error = "ERROR submitting the assignment";
	    });
    	/*
        self._AssignmentService.submitAssignmentAnswers(self.courseId, self.moduleId, self.groupId)
            .then(function(payload){
                self._$state.go('app.course.assignment', { moduleId: self.moduleId }, { reload:true });
        }, function(err){
           self.error = "ERROR submitting the assignment";
        });
        */
    }, function(){
        console.log("They said no");
    });
};

Controller.prototype.getPage = function(newPage){
    var self = this;
    if(newPage >= self.minPage && newPage <= self.maxPage && newPage != self.currentPage){
        self.getQuestions(newPage);
    }
}

Controller.prototype.closeErrorAlert = function(){
	self = this;
	self.error = false;
};

module.exports = angular.module('app.views.student.assignment.questions.controller', [
    'app.models.assignment',
    'app.models.question',
    'app.settings'
])
.controller('Student.AssignmentQuestionsCtrl', Controller);
