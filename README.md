# module.persistence.inmemory

- [Persistence](https://git02.int.nsc.ag/Research/fua/lib/module.persistence)

## Interface

- [RDF/JS: Dataset specification](https://rdf.js.org/dataset-spec/)

```ts
interface DatasetCore extends Iterable<Quad> {
    size: number;
    add(quad: Quad): boolean;
    delete(quad: Quad): boolean;
    has(quad: Quad): boolean;
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): DatasetCore;
};
```

```ts
interface DatasetCoreFactory {
    dataset(quads?: Iterable<Quad>): DatasetCore;
};
```

```ts
interface DataStoreCore extends DatasetCore, EventEmitter {
    size(): Promise<number>;
    add(quad: Quad): Promise<boolean>;
    delete(quad: Quad): Promise<boolean>;
    has(quad: Quad): Promise<boolean>;
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<DatasetCore>;
};
```

```ts
interface DataStoreCoreFactory {
    store(graph: NamedNode): DataStoreCore;
};
```