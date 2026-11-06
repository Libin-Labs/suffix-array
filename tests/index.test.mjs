import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createSuffixArray } from '../dist/esm/index.js';
test('banana suffixes Kasai LCP and find', () => {
  const index = createSuffixArray('banana');
  assert.deepEqual(index.suffixes(), [5, 3, 1, 0, 4, 2]);
  assert.deepEqual(index.lcp(), [0, 1, 3, 0, 0, 2]);
  assert.deepEqual(index.find('ana'), [1, 3]);
  assert.equal(index.length, 6);
});
test('empty text singleton repeated UTF16 and controls', () => {
  assert.deepEqual(createSuffixArray('').suffixes(), []);
  assert.deepEqual(createSuffixArray('').find('x'), []);
  assert.deepEqual(createSuffixArray('a').lcp(), [0]);
  assert.deepEqual(createSuffixArray('aaaa').lcp(), [0, 1, 2, 3]);
  assert.deepEqual(createSuffixArray('😀\0😀').find('😀'), [0, 3]);
});
test('empty pattern and length limits are explicit', () => {
  assert.throws(() => createSuffixArray('abc', { maxLength: 2 }), TypeError);
  assert.throws(() => createSuffixArray('a', { maxLength: 0 }), RangeError);
  assert.throws(() => createSuffixArray('a').find(''), TypeError);
  assert.throws(() => createSuffixArray(null), TypeError);
});
test('result budgets exact boundary no partial arrays', () => {
  const index = createSuffixArray('aaaa');
  assert.deepEqual(index.find('a', 4), [0, 1, 2, 3]);
  assert.throws(() => index.find('a', 3), RangeError);
  assert.throws(() => index.find('a', 0), RangeError);
  assert.deepEqual(index.find('b', 1), []);
});
test('arrays are independently owned', () => {
  const index = createSuffixArray('banana');
  index.suffixes().fill(0);
  index.lcp().fill(99);
  index.find('ana').fill(100);
  assert.deepEqual(index.suffixes(), [5, 3, 1, 0, 4, 2]);
  assert.deepEqual(index.find('ana'), [1, 3]);
});
test('seeded naive suffix/LCP/search oracle, 400 cases', () => {
  let seed = 366;
  const random = (n) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % n;
  };
  const word = (n) =>
    Array.from({ length: n }, () => ['a', 'b', '\0', '\ud83d', '\ude00'][random(5)]).join('');
  for (let trial = 0; trial < 400; trial++) {
    const text = word(random(45)),
      index = createSuffixArray(text),
      suffixes = Array.from({ length: text.length }, (_, i) => i);
    suffixes.sort((a, b) => (text.slice(a) < text.slice(b) ? -1 : 1));
    const lcp = suffixes.map((offset, i) => {
      if (!i) return 0;
      let n = 0;
      const previous = suffixes[i - 1];
      while (
        offset + n < text.length &&
        previous + n < text.length &&
        text[offset + n] === text[previous + n]
      )
        n++;
      return n;
    });
    assert.deepEqual(index.suffixes(), suffixes);
    assert.deepEqual(index.lcp(), lcp);
    const pattern = word(1 + random(5)),
      expected = [];
    for (let i = 0; i + pattern.length <= text.length; i++)
      if (text.slice(i, i + pattern.length) === pattern) expected.push(i);
    assert.deepEqual(index.find(pattern), expected);
  }
});
test('CJS surface', () => {
  assert.deepEqual(
    createRequire(import.meta.url)('../dist/cjs/index.js')
      .createSuffixArray('ab')
      .find('b'),
    [1],
  );
});
