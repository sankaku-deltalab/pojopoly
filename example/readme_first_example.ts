import {
  DefProtocolMarker,
  ImplBase,
  generateRegisterImpl,
  getImpl,
} from 'pojopoly';

// Protocol (like superclass)
const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
export type Listable<T> = DefProtocolMarker<typeof pKey, typeof sKey, [T]>;

export interface ListableImpl<T> {
  list(): T[];
}

// NOTE: This example use namespace but you have not to use.
export namespace Listable {
  export const registerImpl = generateRegisterImpl<ListableImpl<unknown>>(pKey);
  function v<T>(listable: Listable<T>): ListableImpl<T> {
    return getImpl<Listable<T>>(pKey, sKey, listable);
  }
  // boilerplate code

  export function list<T>(listable: Listable<T>): T[] {
    return v(listable).list();
  }
}

// Implementation (like subclass)
export type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T>;

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

// Usage
// NOTE: ArrayObj file must be already executed
const createArrayObj = <T>(items: T[]): ArrayObj<T> => ({
  type: 'array-obj',
  ary: items,
});

const aryObj = createArrayObj([1, 2, 3]);
console.log(Listable.list(aryObj)); // [1, 2, 3]
