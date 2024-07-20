import {ArrayObj} from './support/array-obj';
import {Listable} from './support/listable';
import {Printable} from './support/printable';
import {RecordObj} from './support/record-obj';
import {UnregisteredObj} from './support/unregistered-obj';

test('list ArrayObj', () => {
  const ary = ArrayObj.create([1, 2, 3]);
  const list = Listable.list(ary);
  expect(list).toStrictEqual([1, 2, 3]);
});

test('list RecordObj', () => {
  const rec = RecordObj.create({a: 1, b: 2, c: 3});
  const list = Listable.list(rec);
  expect(list).toStrictEqual([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]);
});

test('throw error if implementation is not registered', () => {
  const unregisteredObj = UnregisteredObj.create();
  expect(() => Listable.list(unregisteredObj)).toThrow();
});

test('multiple protocol', () => {
  const ary = ArrayObj.create([1, 2, 3]);

  const list = Listable.list(ary);
  expect(list).toStrictEqual([1, 2, 3]);

  const text = Printable.print(ary);
  expect(text).toBe('ArrayObj(1,2,3)');
});
