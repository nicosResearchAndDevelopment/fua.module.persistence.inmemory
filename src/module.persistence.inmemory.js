const
    dataFactory = require('../../module.persistence/src/module.persistence.js'),
    Dataset = require('./Dataset.js'),
    n3 = require('n3');

/**
 * @typedef {string} TermIdentifier
 */

/**
 * @param {Iterable<Quad>} [quads]
 * @returns {Dataset}
 */
function dataset(quads) {
    return new Dataset(quads);
}

/**
 * @param {Dataset} that
 * @returns {boolean}
 */
function isDataset(that) {
    return that instanceof Dataset;
}

/**
 * @param {Term} term
 * @returns {TermIdentifier}
 */
function termToId(term) {
    return n3.termToId(term);
} // termToId

/**
 * @param {TermIdentifier} termId
 * @returns {Term}
 */
function termFromId(termId) {
    return n3.termFromId(termId, dataFactory);
} // termFromId

exports = module.exports = {
    dataset, isDataset,
    termToId, termFromId
}; // exports