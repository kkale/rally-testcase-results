var app = null;
var chartData = [];

Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',

    scopeType: 'release',

    onScopeChange: function(scope) {
        app.launch();
    },

    launch: function() {
    	app = this;
    	console.log("Launcing app");
    	var releaseStartDate = app.getContext().getTimeboxScope().getRecord().get("ReleaseStartDate");
    	var releaseEndDate = app.getContext().getTimeboxScope().getRecord().get("ReleaseDate");
    	console.log("Start Date: ", releaseStartDate);
    	console.log("End Date: ", releaseEndDate);

		var iterationStore = Ext.create('Rally.data.wsapi.Store', {
		    model: 'Iteration',
		    fetch: ['Name', 'startDate', 'endDate'],
		    filters:[
		    	{
		    		property: "startDate",
		    		operator: ">=",
		    		value: releaseStartDate
		    	},
		    	{
		    		property: "endDate",
		    		operator: "<=",
		    		value: releaseEndDate
		    	}
		    ], 
		    autoLoad: false,
		});

		iterationStore.load().then({
			success: app.loadIterationsData
		}).then({
			success: function(result){
				console.log("Result: ", result);
			}
		}); 

    },

    loadIterationsData: function(iterations) {
    	var promises = [];
    	_.each(iterations, function(iteration) {
    		console.log("Iteration: ", iteration);
    		promises.push(app.getiOSTestDataForIteration(iteration));
    	});
    	return Deft.Promise.all(promises);
    },

    getiOSTestDataForIteration: function(iteration) {
		var testResultStore = Ext.create('Rally.data.wsapi.Store', {
			    model: 'TestCaseResult', //or defectModel
			    fetch: ['Verdict', 'Date', 'EndDate', 'TestCase', "SystemPackage"],
			    filters:[
			    	{
			    		property: "Date",
			    		operator: ">=",
			    		value: Rally.util.DateTime.toIsoString(iteration.get("StartDate"))
			    	},
			    	{
			    		property: "Date",
			    		operator: "<=",
			    		value: Rally.util.DateTime.toIsoString(iteration.get("EndDate"))
			    	},
			    	{
			    		property: "SystemPackage",
			    		operator: "=",
			    		value: "iOS System"
			    	}
			    ], 
			    sorters: [
			    	{
			    		property: "Date",
			    		Order: "DESC"
			    	}
			    ],
			    autoLoad: false,
		    });
		var promise = testResultStore.load();
		return promise;
    }

});
