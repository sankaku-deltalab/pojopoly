import {DefProtocolMarker, generateRegisterImpl, getImpl} from '../../src';

const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
export type Listable<T> = DefProtocolMarker<typeof pKey, typeof sKey, [T]>;
// Add generics to `DefProtocolMarker` for type annotation.

export interface ListableImpl<T> {
  list(): T[];
}

export namespace Listable {
  export const registerImpl = generateRegisterImpl<ListableImpl<unknown>>(pKey);

  function v<T>(listable: Listable<T>): ListableImpl<T> {
    return getImpl<Listable<T>>(pKey, sKey, listable);
  }

  export function list<T>(listable: Listable<T>): T[] {
    return v(listable).list();
  }
}
