var courseModel = require('./course');
var assignmentModel = require('./assignment');
var groupModel = require('./group');
var questionModel = require('./question');
var courseMembersModel = require('./course_members');
var userModel = require('./user');
var adminModel = require('./admin');
var errorModel = require('./error');

module.exports = angular.module('app.models', [
    courseModel.name,
    assignmentModel.name,
    groupModel.name,
    questionModel.name,
    courseMembersModel.name,
    userModel.name,
    adminModel.name,
    errorModel.name
])
