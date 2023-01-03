# @nrd/fua.module.persistence.inmemory

- [Persistence](https://git02.int.nsc.ag/Research/fua/lib/module.persistence)

```ts
interface InmemoryFactory extends DatasetCoreFactory {
	dataset(quads?: Iterable<Quad>): DatasetCore;
};
```
