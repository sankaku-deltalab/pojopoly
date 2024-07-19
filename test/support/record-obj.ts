import {ImplBase} from '../../src';
import {Listable, ListableImpl} from './listable';

export type RecordObj<K extends string, V> = {
  type: 'record-obj';
  rec: Record<K, V>;
} & Listable<[K, V]>;

export namespace RecordObj {
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
