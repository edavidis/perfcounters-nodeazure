

var Perform = require('../index');


function test() {

	var roleDeploymentID = 'azureDeployID';
	var roleName = 'WebRole01';
	var roleInstanceID = 'WebRole';
	var counters = ['\\Información del procesador(_Total)\\% de tiempo de procesador', '\\Servicio HTTP\\TotalUrisCached'];
	var azureStorageAccount = 'XXX';
	var azureStorageAccessKey = 'XXX';

	var perform = new Perform(roleDeploymentID, roleName, roleInstanceID, azureStorageAccount, azureStorageAccessKey, 10000);

	// establece la frecuencia con la que se graban los indicadores a la tabla de azure
	perform.setSaveToAzureInterval(10000); 

	// da comienzo a la lectura de indicadores
	perform.readCounters(counters, 5); 

	// despues de un tiempo paramos la lectura y grabación de contadores
	setTimeout(perform.stop, 30000);

}

test();