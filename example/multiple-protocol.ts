import {
  DefProtocolMarker,
  ImplBase,
  generateRegisterImpl,
  getImpl,
} from 'pojopoly';

//
// Define protocol
//

// Listable

const [pKeyListable, sKeyListable] = [Symbol('MyApp.Listable'), 'type'];
type Listable<T> = DefProtocolMarker<
  typeof pKeyListable,
  typeof sKeyListable,
  [T]
>;

interface ListableImpl<T> {
  list(): T[];
}

namespace Listable {
  export const registerImpl =
    generateRegisterImpl<ListableImpl<unknown>>(pKeyListable);

  function v<T>(listable: Listable<T>): ListableImpl<T> {
    return getImpl<Listable<T>>(pKeyListable, sKeyListable, listable);
  }

  export function list<T>(listable: Listable<T>): T[] {
    return v(listable).list();
  }
}

// Printable

const [pKeyPrintable, sKeyPrintable] = [Symbol('MyApp.Printable'), 'type'];
export type Printable = DefProtocolMarker<
  typeof pKeyPrintable,
  typeof sKeyPrintable
>;

export interface PrintableImpl {
  print(): string;
}

export namespace Printable {
  export const registerImpl =
    generateRegisterImpl<PrintableImpl>(pKeyPrintable);

  function v(Printable: Printable): PrintableImpl {
    return getImpl<Printable>(pKeyPrintable, sKeyPrintable, Printable);
  }

  export function print(Printable: Printable): string {
    return v(Printable).print();
  }
}

//
// Define subtype and implementation
//

// array-obj

type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T> &
  Printable;

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

//
// usage
//

const ary = ArrayObj.create([1, 2, 3]);

const listOfAry = Listable.list(ary); // number[]
const printableAry = Printable.print(ary); // string

console.log(listOfAry); // [1, 2, 3]
console.log(printableAry); // ArrayObj(1, 2, 3)
