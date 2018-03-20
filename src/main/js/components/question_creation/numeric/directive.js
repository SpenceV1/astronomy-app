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
        
        if(!("points") in scope.model)){
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
