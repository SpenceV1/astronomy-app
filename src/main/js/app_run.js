
function onStateChange($rootScope, $state, $q, AuthService, SessionService, GroupService, AuthService){
    "ngInject";

    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams){
        if(SessionService.getUser()){
            if(fromState
                && fromState.name == 'app.course.assignment.questions'
                && toState.name != fromState.name && fromParams.leaving == false){
            	if(toParams.submitted == true) {
            		//submitting assignment
            		GroupService.groupCheckout(fromParams.courseId, fromParams.moduleId, fromParams.groupId);
            	} else {
            		var leaveAssignment = confirm('Leaving this assignment will log out your group.\nAny unsaved changes will also be lost.\nPress "OK" to leave or "Cancel" to return to the assignment.');
                	if(leaveAssignment){
                		//leaving assignment
                		evt.preventDefault();
                    	GroupService.groupCheckout(fromParams.courseId, fromParams.moduleId, fromParams.groupId);
                    	fromParams.leaving = true;
                    	$state.go(toState, toParams, {location: 'replace'});
                    }else {
                    	//continuing assignment
                    	evt.preventDefault();
                    }
            	}
            }

            //redirect to default state, the courses page
            if(toState.redirectTo){
                evt.preventDefault();
                $state.go(toState.redirectTo, toParams, {location: 'replace'});
            }
            console.log("inside state change");

        //If the user has previously been authenticated

            if(toState.name == 'app.login'){
                console.log("commented out section")
                AuthService.isAuthenticated().then(
                    function(response){
                        $state.go('app.courses');
                    }, function(err){
                        SessionService.destroy();
                    });
            }
        //if the user has not been previosuly authenticated
        }
        else if(!SessionService.getUser()) {
            console.log("Inside state change for not logged in ");
            if(toState.name != 'app.login' ){
                evt.preventDefault();
                AuthService.logout();
            }
        }
    });

    $rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, error) {
        console.log(error);
    });
}

module.exports = onStateChange;
