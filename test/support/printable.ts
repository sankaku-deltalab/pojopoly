import {DefProtocolMarker, generateRegisterImpl, getImpl} from '../../src';

const [pKey, sKey] = [Symbol('MyApp.Printable'), 'type'];
export type Printable = DefProtocolMarker<typeof pKey, typeof sKey>;

export interface PrintableImpl {
  print(): string;
}

export namespace Printable {
  export const registerImpl = generateRegisterImpl<PrintableImpl>(pKey);

  function v(Printable: Printable): PrintableImpl {
    return getImpl<Printable>(pKey, sKey, Printable);
  }

  export function print(Printable: Printable): string {
    return v(Printable).print();
  }
}
