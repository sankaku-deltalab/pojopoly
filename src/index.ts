/**
 * @module pojopoly
 * @description A library for polymorphism with POJO object in TypeScript.
 * @example
 * ```ts
 * import {
 *   DefProtocolMarker,
 *   ImplBase,
 *   generateRegisterImpl,
 *   getImpl,
 * } from 'pojopoly';
 *
 * //
 * // Define protocol
 * //
 *
 * const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
 * type Listable<T> = DefProtocolMarker<typeof pKey, typeof sKey, [T]>;
 * // Add generics to `DefProtocolMarker` for type annotation.
 *
 * interface ListableImpl<T> {
 *   list(): T[];
 * }
 *
 * namespace Listable {
 *   export const registerImpl = generateRegisterImpl<ListableImpl<unknown>>(pKey);
 *
 *   function v<T>(listable: Listable<T>): ListableImpl<T> {
 *     return getImpl<Listable<T>>(pKey, sKey, listable);
 *   }
 *
 *   export function list<T>(listable: Listable<T>): T[] {
 *     return v(listable).list();
 *   }
 * }
 *
 * //
 * // Define subtype and implementation
 * //
 *
 * // array-obj
 *
 * type ArrayObj<T> = {
 *   type: 'array-obj';
 *   ary: T[];
 * } & Listable<T>;
 *
 * namespace ArrayObj {
 *   export function create<T>(ary: T[]): ArrayObj<T> {
 *     return {type: 'array-obj', ary};
 *   }
 * }
 *
 * class ImplListableForArrayObj<T>
 *   extends ImplBase<ArrayObj<T>>
 *   implements ListableImpl<T>
 * {
 *   static subtypeId = 'array-obj';
 *
 *   list(): T[] {
 *     return this.v.ary;
 *   }
 * }
 * Listable.registerImpl(ImplListableForArrayObj);
 *
 * // record-obj
 *
 * type RecordObj<K extends string, V> = {
 *   type: 'record-obj';
 *   rec: Record<K, V>;
 * } & Listable<[K, V]>;
 *
 * namespace RecordObj {
 *   export function create<K extends string, V>(
 *     rec: Record<K, V>
 *   ): RecordObj<K, V> {
 *     return {type: 'record-obj', rec};
 *   }
 * }
 *
 * class ImplListableForRecordObj<K extends string, V>
 *   extends ImplBase<RecordObj<K, V>>
 *   implements ListableImpl<[K, V]>
 * {
 *   static subtypeId = 'record-obj';
 *
 *   list(): [K, V][] {
 *     return Object.entries(this.v) as [K, V][];
 *   }
 * }
 * Listable.registerImpl(ImplListableForRecordObj);
 *
 * //
 * // usage
 * //
 *
 * const ary = ArrayObj.create([1, 2, 3]);
 * const rec = RecordObj.create({a: 1, b: 2, c: 3});
 *
 * const listOfAry = Listable.list(ary); // number[]
 * const listOfRec = Listable.list(rec); // ["a" | "b" | "c", number][]
 *
 * console.log(listOfAry); // [1, 2, 3]
 * console.log(listOfRec); // [["a", 1], ["b", 2], ["c", 3]]
 * ```
 */

/**
 * ProtocolKey is a symbol that represents a protocol.
 * A Protocol needs a unique ProtocolKey.
 */
type ProtocolKey = symbol;

/**
 * SubTypeKey is a key contain subtype-value for objects.
 *
 * @example
 * ```ts
 * // SubTypingKey is "kind".
 * // SubTypeId is "list".
 * type Listable<T> = {
 *   kind: "list",
 *   ary: T[],
 * }
 * ```
 */
type SubTypingKey = string | number;

/**
 * SubTypeId represents a subtype.
 *
 * @example
 * ```ts
 * // SubTypingKey is "kind".
 * // SubTypeId is "list".
 * type Listable<T> = {
 *   kind: "list",
 *   ary: T[],
 * }
 * ```
 */
type SubTypeId = string | number;

/**
 * DefProtocolMarker defines `ProtocolMarker` type for type annotation.
 *
 * @example
 * ```ts
 * const [protocolKey, subTypingKey] = [Symbol('MyApp.Listable'), 'type'];
 * type Listable<T> = DefProtocolMarker<typeof protocolKey, typeof subTypingKey, [T]>;
 * // Listable<T> is `{[protocolKey]?: {subtypeKey: [subTypingKey]; generics: [T]}}`
 * // But practically, Listable<T> is `{}` because protocolKey will never be assigned.
 * ```
 */
export type DefProtocolMarker<
  PKey extends ProtocolKey,
  SKey extends SubTypingKey,
  Generics extends unknown[] = [],
> = Partial<
  Record<
    PKey,
    {
      subtypeKey: SKey;
      generics: Generics;
    }
  >
>;

/**
 * ImplBase is a base class for implementations.
 *
 * @example
 * ```ts
 * type ArrayObj<T> = {
 *  type: 'array-obj';
 *   ary: T[];
 * } & Listable<T>;
 *
 * class ImplListableForArrayObj<T>
 *   extends ImplBase<ArrayObj<T>>
 *   implements ListableImpl<T>
 * {
 *   static subtypeId = 'array-obj';
 *   list(): T[] {
 *     return this.v.ary;  // this.v is ArrayObj<T>
 *   }
 * }
 * ```
 */
export class ImplBase<T> {
  static subtypeId: SubTypeId;

  /**
   * @constructor
   * @param {T} v - The value to be protected.
   */
  constructor(protected readonly v: T) {}
}

namespace ProtocolState {
  export const implMap: Map<
    ProtocolKey,
    Map<SubTypeId, typeof ImplBase<unknown>>
  > = new Map();
}

/**
 * Register an implementation.
 */
function registerImpl(
  protocolKey: ProtocolKey,
  subTypeId: SubTypeId,
  impl: typeof ImplBase<unknown>
): void {
  let subtypeMap = ProtocolState.implMap.get(protocolKey);
  if (!subtypeMap) {
    subtypeMap = new Map();
    ProtocolState.implMap.set(protocolKey, subtypeMap);
  }
  subtypeMap.set(subTypeId, impl);
}

type ClassImplements<T> = new (...args: any[]) => T;

/**
 * Generate implementation registering function.
 *
 * @example
 * ```ts
 * // In protocol file
 * export const registerImpl =
 *   generateRegisterImpl<ListableImpl<unknown>>(listableKey);
 *
 * // In implementation file
 * class ImplListableForArrayObj<T>
 *   extends ImplBase<ArrayObj<T>>
 *   implements ListableImpl<T>
 * {
 *   static subtypeId = 'array-obj';
 *   // ...
 * }
 * registerImpl(ImplListableForArrayObj);
 * ```
 */
export function generateRegisterImpl<Impl>(
  protocolKey: ProtocolKey
): (impl: typeof ImplBase<unknown> & ClassImplements<Impl>) => void {
  return impl => {
    if (!impl.subtypeId) {
      throw new Error(
        'Implementation class must have static property "subtypeId"'
      );
    }
    registerImpl(protocolKey, impl.subtypeId, impl);
  };
}

/**
 * Get an implementation.
 *
 * @throws Will throw an error if the protocol or implementation is not found.
 * @example
 * ```ts
 * const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
 * function v<T>(listable: Listable<T>): ListableImpl<T> {
 *   return getImpl<Listable<T>>(pKey, sKey, listable);
 * }
 * ```
 */
export function getImpl<T>(
  protocolKey: ProtocolKey,
  subTypingKey: SubTypingKey,
  obj: T
): any {
  const subtypeId = (obj as any)[subTypingKey];
  const subtypeMap = ProtocolState.implMap.get(protocolKey);
  if (!subtypeMap) {
    throw new Error(`Protocol <${protocolKey.toString()}> not found`);
  }
  const ImplClass = subtypeMap.get(subtypeId);
  if (!ImplClass) {
    throw new Error(`Implementation <${subtypeId.toString()}> not found`);
  }
  return new ImplClass(obj);
}
