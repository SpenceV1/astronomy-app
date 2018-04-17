
function Controller($scope, $state, $stateParams, appSettings, AssignmentService, QuestionService, ConfirmationService, AlertService){
    "ngInject";
    this._$state = $state;
    this.pageName = "Add/Edit ";
    this.courseId = $stateParams.courseId;
    this.moduleId = $stateParams.moduleId;
    this.pageNum = $stateParams.pageNum;
    this.isNew = $stateParams.isNew;
    this.questionTypes = appSettings.QUESTION_TYPES;
    this.selectedQuestionType = appSettings.QUESTION_TYPES[$stateParams.questionType];
    this._$stateParams  = $stateParams;
    this._AssignmentService = AssignmentService;
    this._QuestionService = QuestionService;
    this._ConfirmationService = ConfirmationService;
    this.questionData = $stateParams.questionData;
    this._AlertService = AlertService;
    this.currentDate = new Date();
    this.init();
};

Controller.prototype.init = function(){
    var self = this;
    self.initializeData();
};

Controller.prototype.initializeData = function(){
    var self = this;
    self.questionData.questionType = self._$stateParams.questionType;
};

Controller.prototype.submit = function(payload){
    var self = this;
    if (self.isNew){
        self._QuestionService.addQuestion(self.courseId, self.moduleId, self.pageNum, payload)
        .then(function(payload){
            var params = {
                moduleId : self.moduleId,
                pageNum : self.pageNum,
                success : "Question was successfully created"
            }
            self._$state.go('app.course.assignments_add_edit_questions', params);
        }, function(err){
           self.error = "ERROR creating a new question";
        });
    } else {
    	self._QuestionService.editQuestion(self.courseId, self.moduleId, self.questionData.id, payload)
        .then(function(payload){
        	var params = {
                    moduleId : self.moduleId,
                    pageNum : self.pageNum,
                    success : "Question was successfully updated"
                }
        	self._$state.go('app.course.assignments_add_edit_questions', params);
        }, function(err){
           self.error = "ERROR editing question";
        });
    }
};

module.exports = angular.module('app.views.instructor.question.add_edit', [])
.controller('Instructor.QuestionAddEdit', Controller);
