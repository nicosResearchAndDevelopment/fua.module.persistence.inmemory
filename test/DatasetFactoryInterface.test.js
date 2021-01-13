const
	{ describe, it } = require('mocha'),
	expect = require('expect'),
	dataFactory = require('../../module.persistence/src/module.persistence.js'),
	datasetFactory = require('../src/module.persistence.inmemory.js');

describe('module.persistence.inmemory : DatasetFactoryInterface', function() {

	let dataset, quad_1, quad_2;

	before('construct a dataset and two quads', async function() {
		dataset = datasetFactory.dataset();
		quad_1 = dataFactory.quad(
			dataFactory.namedNode('http://example.com/subject'),
			dataFactory.namedNode('http://example.com/predicate'),
			dataFactory.namedNode('http://example.com/object')
		);
		quad_2 = dataFactory.quad(
			quad_1.subject,
			quad_1.predicate,
			dataFactory.literal('Hello World', 'en')
		);
	});

	it('should add the two quads to the dataset', async function() {
		expect(dataset.add(quad_1)).toBeTruthy();
		expect(dataset.add(quad_2)).toBeTruthy();
	});

	it('should match the two added quads by their subject', async function() {
		/** @type {Dataset} */
		const result = dataset.match(quad_1.subject);
		expect(result.has(quad_1)).toBeTruthy();
		expect(result.has(quad_2)).toBeTruthy();
	});

	it('should currently have a size of 2', async function() {
		expect(dataset.size).toBe(2);
	});

	it('should delete the first quad', async function() {
		expect(dataset.delete(quad_1)).toBeTruthy();
	});

	it('should only have the second quad stored', async function() {
		expect(dataset.has(quad_1)).toBeFalsy();
		expect(dataset.has(quad_2)).toBeTruthy();
	});

	it('should match the remaining quad by its object', async function() {
		/** @type {Dataset} */
		const result = dataset.match(null, null, quad_2.object);
		expect(result.has(quad_1)).toBeFalsy();
		expect(result.has(quad_2)).toBeTruthy();
	});

	it('should have a size of 0, after it deleted the second quad', async function() {
		dataset.delete(quad_2);
		expect(dataset.size).toBe(0);
	});

});