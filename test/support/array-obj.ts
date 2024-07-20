import {ImplBase} from '../../src';
import {Listable, ListableImpl} from './listable';
import {Printable, PrintableImpl} from './printable';

export type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T> &
  Printable;

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

class ImplPrintableForArrayObj<T>
  extends ImplBase<ArrayObj<T>>
  implements PrintableImpl
{
  static subtypeId = 'array-obj';

  print(): string {
    return `ArrayObj(${this.v.ary})`;
  }
}
Printable.registerImpl(ImplPrintableForArrayObj);
