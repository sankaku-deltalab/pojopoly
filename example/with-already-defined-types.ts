import {ImplBase, generateRegisterImpl, getImpl} from 'pojopoly';

//
// Types are already defined without protocol marker
//

type Item<T> = ArrayObj<T> | MapObj<T>;

type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
};

type MapObj<V> = {
  type: 'map-obj';
  map: Map<string, V>;
};

//
// Define protocol. Use already defined type instead of `ProtocolMarker`.
//

const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];

interface ListableImpl<T> {
  list(): T[];
}

namespace Listable {
  export const registerImpl = generateRegisterImpl<ListableImpl<unknown>>(pKey);

  function v<T>(item: Item<T>): ListableImpl<T> {
    return getImpl(pKey, sKey, item);
  }

  export function list<T>(listable: Item<T>): T[] {
    return v(listable).list();
  }
}

//
// Define implements
//

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

class ImplListableForMapObj<V>
  extends ImplBase<MapObj<V>>
  implements ListableImpl<V>
{
  static subtypeId = 'map-obj';

  list(): V[] {
    return [...this.v.map.values()];
  }
}
Listable.registerImpl(ImplListableForMapObj);

//
// usage
//

const ary: ArrayObj<number> = {
  type: 'array-obj',
  ary: [1, 2, 3],
};
const map: MapObj<string> = {
  type: 'map-obj',
  map: new Map([
    ['a', '1'],
    ['b', '2'],
    ['c', '3'],
  ]),
};

const listOfAry = Listable.list(ary); // number[]
const listOfMap = Listable.list(map); // string[]

console.log(listOfAry); // [1, 2, 3]
console.log(listOfMap); // ["1", "2", "3"]
