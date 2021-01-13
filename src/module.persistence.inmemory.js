const
	// dataFactory = require('../../module.persistence/src/module.persistence.js'),
	Dataset = require('./Dataset.js');

/**
 * @param {Iterable<Quad>} [quads]
 * @returns {Dataset}
 */
exports.dataset = function(quads) {
	return new Dataset(quads);
};