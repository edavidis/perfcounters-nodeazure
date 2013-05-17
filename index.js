var azure = require('azure');
var perfmon = require('perfmon');

module.exports = PerfCountersToAzure;

var saveToAzure = true;

function PerfCountersToAzure(roleDeploymentID, roleName, roleInstanceID, azureStorageAccount, azureStorageAccessKey, saveToAzureInterval) {

	this._roleDeploymentID = roleDeploymentID;
	this._roleName = roleName;
	this._roleInstanceID = roleInstanceID;

	this._azureStorageAccount = azureStorageAccount;
	this._azureStorageAccessKey = azureStorageAccessKey;

	this._counters = new Array();

	this._saveToAzureInterval = saveToAzureInterval || 30000;

	var self = this;

	setTimeout(function () {

		self._saveCountersToAzure(self);

	}, self._saveToAzureInterval);
}

PerfCountersToAzure.prototype = {

	setSaveToAzureInterval: function(intervalInMilliseconds) {
		this._saveToAzureInterval = intervalInMilliseconds;
	},

	stop: function() {

		perfmon.stop();
		saveToAzure = false;

	},

	readCounters: function(counters, intervalInSecodns) {

		
		
		var count = 0;
		var self = this;

		perfmon(counters, function (err, data) {
			
			++count;
			if (count == intervalInSecodns) { 

				count = 0;
				var count3 = 0;
				var tick = ((new Date().getTime() * 10000) + 621355968000000000);

				for (var index in data.counters) {
                   
                   count3++;
                   var row = {
                       RowKey: (self._roleDeploymentID) + '___' + (self.__roleName) + '___' + (self._roleInstanceID) + '___' + tick.toString() + count3.toString() + '___WADPerformanceCountersLocalQuery',
                       EventTickCount: azInt64(tick),
                       DeploymentId: self._roleDeploymentID,
                       Role: self.__roleName,
                       RoleInstance: self._roleInstanceID,
                       CounterName: index,
                       CounterValue: azDouble(data.counters[index])
                   };

                   self._counters.push(row);

               }

			}


		});

	},

	_saveCountersToAzure: function (scope) {

		 var tableService = azure.createTableService(scope._azureStorageAccount, scope._azureStorageAccessKey);

	    tableService.createTableIfNotExists('WADPerformanceCountersTable', function (error) {
	        if (!error) {
	            // Table exists or created
	        }
	    });

	    var arr = scope._counters.slice(0);
	    scope._counters.length = 0;

	    var tick = ((new Date().getTime() * 10000) + 621355968000000000);
	    var pkey = '0' + tick.toString();
	    var row;
	    for (var index in arr) {

	        row = arr[index];
	        row.PartitionKey = pkey;
	        
	        tableService.insertEntity('WADPerformanceCountersTable', row, function (error) {
	            if (!error) {
	                // Entity inserted
	            }
	        });
	    }

	    if (saveToAzure) {

	    	setTimeout(function() {
	    		scope._saveCountersToAzure(scope);
	    	}, scope._saveToAzureInterval);

	    } 
	    	

	}



};




function azType(type, v) { return { "@": { type: type }, "#": v }; }
function azBool(v) { return azType("Edm.Boolean", v); }
function azBinary(v) { return azType("Edm.Binary", v); }
function azByte(v) { return azType("Edm.Byte", v); }
function azDateTime(v) { return azType("Edm.DateTime", v); }
function azDateTimeOffset(v) { return azType("Edm.DateTimeOffset", v); }
function azDecimal(v) { return azType("Edm.Decimal", v); }
function azDouble(v) { return azType("Edm.Double", v); }
function azGuid(v) { return azType("Edm.Guid", v); }
function azInt64(v) { return azType("Edm.Int64", v); }
function azInt32(v) { return azType("Edm.Int32", v); }
function azInt16(v) { return azType("Edm.Int16", v); }
function azSByte(v) { return azType("Edm.SByte", v); }
function azSingle(v) { return azType("Edm.Single", v); }
function azString(v) { return azType("Edm.String", v); }
function azTime(v) { return azType("Edm.Time", v); }

