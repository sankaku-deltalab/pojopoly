# 🎩 Pojopoly

**Pojopoly** realizes class-like typed polymorphism for POJO (Plain Old JavaScript Object).

```ts
// Protocol (like superclass)
const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
export type Listable<T> = DefProtocolMarker<typeof pKey, typeof sKey, [T]>;

export interface ListableImpl<T> {
  list(): T[];
}

// NOTE: This example use namespace but you have not to use.
export namespace Listable {
  // boilerplate code

  export function list<T>(listable: Listable<T>): T[] {
    return v(listable).list();
  }
}
```

```ts
// Implementation (like subclass)
export type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T>;

class ImplListableForArrayObj<T> extends //...
{
  static subtypeId = 'array-obj';

  list(): T[] {
    return this.v.ary;
  }
}
Listable.registerImpl(ImplListableForArrayObj);
```

```ts
// Usage
// NOTE: ArrayObj file must be already executed
const createArrayObj = <T>(items: T[]): ArrayObj<T> => ({
  type: 'array-obj',
  ary: items,
});
const aryObj = createArrayObj([1, 2, 3]);
console.log(Listable.list(aryObj)); // [1, 2, 3]
```

## When to Use Pojopoly

- You need polymorphism for state object that contain only JSON-serializable data, such as those used in [Redux](https://redux.js.org).
- You want to define functions with the [Open-Closed Principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle) while working with POJO objects.

## Example & Usage

### Basic

```ts
import {
  DefProtocolMarker,
  ImplBase,
  generateRegisterImpl,
  getImpl,
} from 'pojopoly';

//
// Define protocol (like superclass)
//

const drawableKey = Symbol('MyApp.Drawable');
const subtypeKey = 'kind';
type Drawable = DefProtocolMarker<typeof drawableKey, typeof subtypeKey>;
// `DefProtocolMarker` generates `{<drawableKey>?: {/** Some info */}}` for type annotation.
// Practically, `Drawable` is `{}`.

interface DrawableImpl {
  draw(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D;
}

namespace Drawable {
  export const registerImpl = generateRegisterImpl<DrawableImpl>(drawableKey);

  function v(drawable: Drawable): DrawableImpl {
    return getImpl<Drawable>(drawableKey, subtypeKey, drawable);
  }

  export function draw(
    drawable: Drawable,
    ctx: CanvasRenderingContext2D
  ): CanvasRenderingContext2D {
    return v(drawable).draw(ctx);
  }
}

//
// Define types (like subclass fields)
//

type Drawer = (
  | {
      kind: 'circle';
      pos: {x: number; y: number};
      radius: number;
    }
  | {
      kind: 'rect';
      pos: {x: number; y: number};
      size: {x: number; y: number};
    }
) &
  Drawable; // Intersect Marker for type annotation

//
// Define implements (like subclasses methods)
//

class ImplDrawerForCircle
  extends ImplBase<Drawer & {kind: 'circle'}>
  implements DrawableImpl
{
  static subtypeId = 'circle';

  draw(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
    const {pos, radius} = this.v; // circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    return ctx;
  }
}
Drawable.registerImpl(ImplDrawerForCircle);

class ImplDrawerForRect
  extends ImplBase<Drawer & {kind: 'rect'}>
  implements DrawableImpl
{
  static subtypeId = 'rect';

  draw(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
    const {pos, size} = this.v; // rect
    ctx.beginPath();
    ctx.rect(pos.x, pos.y, size.x, size.y);
    ctx.stroke();
    return ctx;
  }
}
Drawable.registerImpl(ImplDrawerForRect);

//
// usage
//

const ctx = null as any as CanvasRenderingContext2D;
const drawerRect: Drawer = {
  kind: 'rect',
  pos: {x: 1, y: 2},
  size: {x: 11, y: 12},
};
Drawable.draw(drawerRect, ctx);
```

### With Generics

```ts
import {
  DefProtocolMarker,
  ImplBase,
  generateRegisterImpl,
  getImpl,
} from 'pojopoly';

//
// Define protocol
//

const [pKey, sKey] = [Symbol('MyApp.Listable'), 'type'];
type Listable<T> = DefProtocolMarker<typeof pKey, typeof sKey, [T]>;
// Add generics to `DefProtocolMarker` for type annotation.

interface ListableImpl<T> {
  list(): T[];
}

namespace Listable {
  export const registerImpl = generateRegisterImpl<ListableImpl<unknown>>(pKey);

  function v<T>(listable: Listable<T>): ListableImpl<T> {
    return getImpl<Listable<T>>(pKey, sKey, listable);
  }

  export function list<T>(listable: Listable<T>): T[] {
    return v(listable).list();
  }
}

//
// Define subtype and implementation
//

// array-obj

type ArrayObj<T> = {
  type: 'array-obj';
  ary: T[];
} & Listable<T>;

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

// record-obj

type RecordObj<K extends string, V> = {
  type: 'record-obj';
  rec: Record<K, V>;
} & Listable<[K, V]>;

namespace RecordObj {
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

//
// usage
//

const ary = ArrayObj.create([1, 2, 3]);
const rec = RecordObj.create({a: 1, b: 2, c: 3});

const listOfAry = Listable.list(ary); // number[]
const listOfRec = Listable.list(rec); // ["a" | "b" | "c", number][]

console.log(listOfAry); // [1, 2, 3]
console.log(listOfRec); // [["a", 1], ["b", 2], ["c", 3]]
```

### With already defined types

```ts
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
```

### Multiple Protocol

```ts
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
```

## Install

```bash
npm install --save pojopoly
```
