import {ImplBase} from '../../src';
import {Listable, ListableImpl} from './listable';

export type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T>;

export namespace ArrayObj {
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
