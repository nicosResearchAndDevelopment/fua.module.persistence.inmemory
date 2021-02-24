const
    _                    = Object.create(null),
    {Dataset, DataStore} = require('@nrd/fua.module.persistence');

_.lockProp = function (obj, ...keys) {
    const lock = {writable: false, configurable: false};
    for (let key of keys) {
        Object.defineProperty(obj, key, lock);
    }
};

class InmemoryStore extends DataStore {

    constructor(options, factory) {
        super(options || {}, factory);
        this.dataset = new Dataset(null, this.factory);
        _.lockProp(this, 'dataset');
    } // InmemoryStore#constructor

    async size() {
        return this.dataset.size;
    } // InmemoryStore#size

    async match(subject, predicate, object, graph) {
        // const dataset = await super.match(subject, predicate, object, graph);
        return this.dataset.match(subject, predicate, object, graph);
    } // InmemoryStore#match

    async add(quads) {
        // const quadArr = await super.add(quads);
        return this.dataset.add(quads);
    } // InmemoryStore#add

    async addStream(stream) {
        // const quadStream = await super.addStream(stream);
        return this.dataset.addStream(stream);
    } // InmemoryStore#addStream

    async delete(quads) {
        // const quadArr = await super.delete(quads);
        return this.dataset.delete(quads);
    } // InmemoryStore#delete

    async deleteStream(stream) {
        // const quadStream = await super.deleteStream(stream);
        return this.dataset.deleteStream(stream);
    } // InmemoryStore#deleteStream

    async deleteMatches(subject, predicate, object, graph) {
        // await super.deleteMatches(subject, predicate, object, graph);
        return this.dataset.deleteMatches(subject, predicate, object, graph);
    } // InmemoryStore#deleteMatches

    async has(quads) {
        // const quadArr = await super.has(quads);
        return this.dataset.has(quads);
    } // InmemoryStore#has

} // InmemoryStore

module.exports = InmemoryStore;