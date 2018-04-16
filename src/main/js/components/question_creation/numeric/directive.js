function Directive($state){
    "ngInject";

    function link(scope, element, attributes){
        scope.model.pageItemType = "QUESTION";
        if(!("isGatekeeper" in scope.model)){
            scope.model.isGatekeeper = false;
        }

        if(!("options" in scope.model)){
            scope.model.options = [];
        }
        
        if(!("unitPoints" in scope.model)){
            scope.model.unitPoints = 0;
        }
        
        if(!("points" in scope.model)){
        	scope.model.points = 0;
        }

        scope.addNewOption = function(option){
            addOption(scope, option);
        }

        scope.removeOption = function(index){
            scope.model.options.splice(index,1);
        }
        
        scope.removeOptions = function(){
            scope.model.options.length = 0;
        }
        
        scope.showUnit = function(){
        	//if existing question and contains units
        	//or if new question and isUnits is checked.
        	return (scope.model.id != null && scope.model.options.length > 0) || (scope.model.id == null && scope.model.isUnits);
        }
        
        scope.pastOpenDate = function(){
        	return scope.$parent.$parent.questionEditCtrl.currentDate > scope.model.page.module.openTimestamp;
        }
        
        scope.getAnswerBounds = function(){
        	if(("correctCoefficient" in scope.model) && ("correctExponenet" in scope.model) && ("allowedCoefficientSpread" in scope.model)) {
	        	var answerBounds = {};
	        	var coefficient = new BigNumber(scope.model.correctCoefficient);
	        	var exponent = scope.model.correctExponenet;
	        	var spread = new BigNumber(scope.model.allowedCoefficientSpread);
	        	answerBounds.lower = coefficient.minus(spread).shiftedBy(exponent).toExponential();
	        	answerBounds.upper = coefficient.plus(spread).shiftedBy(exponent).toExponential();
	            return answerBounds;
        	} else {
        		return { lower: 0, upper: 0 };
        	}
        }
    }

    function addOption(scope, option){
        var newOption = {
            humanReadableText : option,
            isCorrectOption :  false
        };
        scope.model.options.push(newOption);
        scope.newOption = "";
    };


    var directive = {
        templateUrl: 'components/question_creation/numeric/home.html',
        link : link,
        scope: {
            model: '=',
        }
    }

    return directive;
}

module.exports =  Directive;
