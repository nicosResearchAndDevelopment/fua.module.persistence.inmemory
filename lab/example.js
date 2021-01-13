const
	module_persistence_inmemory = require('./module.persistence.inmemory.beta.js');

(async (/* async IIFE */) => {

	const inmemory_storage = new Map();
	const inmemory_persistence_adapter = module_persistence_inmemory({
		'storage': inmemory_storage
	});

	await inmemory_persistence_adapter.CREATE('test:hello_world');
	await inmemory_persistence_adapter.UPDATE('test:hello_world', '@type', ['rdfs:Resource', 'ldp:NonRDFSource', 'xsd:string']);
	await inmemory_persistence_adapter.UPDATE('test:hello_world', '@value', 'Hello World!');
	await inmemory_persistence_adapter.CREATE('test:lorem_ipsum');
	await inmemory_persistence_adapter.UPDATE('test:lorem_ipsum', 'rdf:label', 'Lorem Ipsum');
	await inmemory_persistence_adapter.UPDATE('test:lorem_ipsum', 'test:property', 'test:hello_world');
	await inmemory_persistence_adapter.UPDATE('test:hello_world', 'test:marzipan', 'test:lorem_ipsum');
	console.log('READ(test:hello_world) =>', await inmemory_persistence_adapter.READ('test:hello_world'), '\n');
	console.log('LIST(test:lorem_ipsum, test:property) =>', await inmemory_persistence_adapter.LIST('test:lorem_ipsum', 'test:property'), '\n');
	await inmemory_persistence_adapter.DELETE('test:hello_world', 'test:marzipan', 'test:lorem_ipsum');

	console.log(inmemory_storage);

})(/* async IIFE */).catch(console.error);
