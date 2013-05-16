var azure = require('azure');
var perfmon = require('perfmon');

module.exports = PerfCountersToAzure;

function PerfCountersToAzure(roleDeploymentID, roleName, roleInstanceID) {

	tself._roleDeploymentID = roleDeploymentID;
	this._roleName = roleName;
	this._roleInstanceID = roleInstanceID;

	this._counters = new Array();

}

PerfCountersToAzure.prototype = {

	readCounters: function(counters, interval) {

		var count = 0;
		var self = this;

		perfmon(counters, function (err, data) {

			++count;
			if (count == interval) { 

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

	saveToAzure: function (azureStorageAccount, azureStorageAccessKey) {

	    var tableService = azure.createTableService(azureStorageAccount, azureStorageAccessKey);

	    tableService.createTableIfNotExists('WADPerformanceCountersTable', function (error) {
	        if (!error) {
	            // Table exists or created
	        }
	    });

	    var arr = this._counters.slice(0);
	    this._counters.length = 0;

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

