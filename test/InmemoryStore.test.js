const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    InmemoryStore            = require('../src/module.persistence.inmemory.js');

describe('module.persistence.inmemory', function () {

    let store, quad_1, quad_2;
    before('construct an InmemoryStore and two quads', function () {
        store  = new InmemoryStore();
        quad_1 = store.factory.quad(
            store.factory.namedNode('http://example.com/subject'),
            store.factory.namedNode('http://example.com/predicate'),
            store.factory.namedNode('http://example.com/object')
        );
        quad_2 = store.factory.quad(
            quad_1.subject,
            quad_1.predicate,
            store.factory.literal('Hello World', 'en')
        );
    });

    test('should add the two quads to the store once', async function () {
        expect(await store.add(quad_1)).toBeTruthy();
        expect(await store.add(quad_2)).toBeTruthy();
        expect(await store.add(quad_1)).toBeFalsy();
        expect(await store.add(quad_2)).toBeFalsy();
    });

    test('should match the two added quads by their subject', async function () {
        /** @type {Dataset} */
        const result = await store.match(quad_1.subject);
        expect(result.has(quad_1)).toBeTruthy();
        expect(result.has(quad_2)).toBeTruthy();
    });

    test('should currently have a size of 2', async function () {
        expect(await store.size()).toBe(2);
    });

    test('should delete the first quad once', async function () {
        expect(await store.delete(quad_1)).toBeTruthy();
        expect(await store.delete(quad_1)).toBeFalsy();
    });

    test('should only have the second quad stored', async function () {
        expect(await store.has(quad_1)).toBeFalsy();
        expect(await store.has(quad_2)).toBeTruthy();
    });

    test('should match the remaining quad by its object', async function () {
        /** @type {Dataset} */
        const result = await store.match(null, null, quad_2.object);
        expect(result.has(quad_1)).toBeFalsy();
        expect(result.has(quad_2)).toBeTruthy();
    });

    test('should have a size of 0, after it deleted the second quad', async function () {
        await store.delete(quad_2);
        expect(await store.size()).toBe(0);
    });

}); // describe