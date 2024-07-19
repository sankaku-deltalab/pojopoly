import {ImplBase} from '../../src';
import {Listable, ListableImpl} from './listable';

export type UnregisteredObj = {
  type: 'unregistered-obj';
} & Listable<unknown>;

export namespace UnregisteredObj {
  export function create(): UnregisteredObj {
    return {type: 'unregistered-obj'};
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ImplListableForUnregisteredObj
  extends ImplBase<UnregisteredObj>
  implements ListableImpl<unknown>
{
  static subtypeId = 'unregistered-obj';

  list(): unknown[] {
    return [];
  }
}

// NOTE: This is commented out to avoid registering the implementation
// Listable.registerImpl(ImplListableForUnregisteredObj);
