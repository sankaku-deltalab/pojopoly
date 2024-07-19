import {
  DefProtocolMarker,
  ImplBase,
  generateRegisterImpl,
  getImpl,
} from 'pojopoly';

//
// Define protocol
//

const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
type Listable<T> = DefProtocolMarker<typeof pKey, typeof sKey, [T]>;
// Add generics to `DefProtocolMarker` for type annotation.

interface ListableImpl<T> {
  list(): T[];
}

namespace Listable {
  export const registerImpl = generateRegisterImpl<ListableImpl<unknown>>(pKey);

  function v<T>(listable: Listable<T>): ListableImpl<T> {
    return getImpl<Listable<T>>(pKey, sKey, listable);
  }

  export function list<T>(listable: Listable<T>): T[] {
    return v(listable).list();
  }
}

//
// Define subtype and implementation
//

// array-obj

type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T>;

namespace ArrayObj {
  export function create<T>(ary: T[]): ArrayObj<T> {
    return {type: 'array-obj', ary};
  }
}

class ImplListableForArrayObj<T>
  extends ImplBase<ArrayObj<T>>
  implements ListableImpl<T>
{
  static subtypeId = 'array-obj';

  list(): T[] {
    return this.v.ary;
  }
}
Listable.registerImpl(ImplListableForArrayObj);

// record-obj

type RecordObj<K extends string, V> = {
  type: 'record-obj';
  rec: Record<K, V>;
} & Listable<[K, V]>;

namespace RecordObj {
  export function create<K extends string, V>(
    rec: Record<K, V>
  ): RecordObj<K, V> {
    return {type: 'record-obj', rec};
  }
}

class ImplListableForRecordObj<K extends string, V>
  extends ImplBase<RecordObj<K, V>>
  implements ListableImpl<[K, V]>
{
  static subtypeId = 'record-obj';

  list(): [K, V][] {
    return Object.entries(this.v.rec) as [K, V][];
  }
}
Listable.registerImpl(ImplListableForRecordObj);

//
// usage
//

const ary = ArrayObj.create([1, 2, 3]);
const rec = RecordObj.create({a: 1, b: 2, c: 3});

const listOfAry = Listable.list(ary); // number[]
const listOfRec = Listable.list(rec); // ["a" | "b" | "c", number][]

console.log(listOfAry); // [1, 2, 3]
console.log(listOfRec); // [["a", 1], ["b", 2], ["c", 3]]
