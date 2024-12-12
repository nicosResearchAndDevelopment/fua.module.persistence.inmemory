const
    util                 = require('@fua/core.util'),
    {Dataset, DataStore} = require('@fua/module.persistence');

class InmemoryStore extends DataStore {

    constructor(options, factory) {
        super(options || {}, factory);
        this.dataset = new Dataset(null, this.factory);
        util.lockProp(this, 'dataset');
    } // InmemoryStore#constructor

    async size() {
        return this.dataset.size;
    } // InmemoryStore#size

    async match(subject, predicate, object, graph) {
        return this.dataset.match(subject, predicate, object, graph);
    } // InmemoryStore#match

    async add(quads) {
        const quadArr = await super.add(quads);
        let added     = 0;
        for (let quad of quadArr) {
            if (!this.dataset.has(quad)) {
                this.dataset.add(quad);
                this.emit('added', quad);
                added++;
            }
        }
        return added;
    } // InmemoryStore#add

    async addStream(stream) {
        const quadStream = await super.addStream(stream);
        let added        = 0;
        quadStream.on('data', (quad) => {
            if (!this.dataset.has(quad)) {
                this.dataset.add(quad);
                this.emit('added', quad);
                added++;
            }
        });
        await new Promise(resolve => quadStream.on('end', resolve));
        return added;
    } // InmemoryStore#addStream

    async delete(quads) {
        const quadArr = await super.delete(quads);
        let deleted   = 0;
        for (let quad of quadArr) {
            if (this.dataset.has(quad)) {
                this.dataset.delete(quad);
                this.emit('deleted', quad);
                deleted++;
            }
        }
        return deleted;
    } // InmemoryStore#delete

    async deleteStream(stream) {
        const quadStream = await super.deleteStream(stream);
        let deleted      = 0;
        quadStream.on('data', (quad) => {
            if (this.dataset.has(quad)) {
                this.dataset.delete(quad);
                this.emit('deleted', quad);
                deleted++;
            }
        });
        await new Promise(resolve => quadStream.on('end', resolve));
        return deleted;
    } // InmemoryStore#deleteStream

    async deleteMatches(subject, predicate, object, graph) {
        const matches = this.dataset.match(subject, predicate, object, graph);
        return await this.delete(matches);
    } // InmemoryStore#deleteMatches

    async has(quads) {
        return this.dataset.has(quads);
    } // InmemoryStore#has

} // InmemoryStore

module.exports = InmemoryStore;
