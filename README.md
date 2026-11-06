# @lp-labs/suffix-array

Prefix-doubling UTF-16 suffix index with Kasai LCP, binary-search lookup and bounded result arrays.

Standalone original implementation; zero runtime, peer, or sibling-package dependencies. Node.js 18+, ESM and CommonJS with separate declaration trees. No browser globals are accessed at import time; compiled runtime uses only standard JavaScript APIs.

## Install

```sh
npm install @lp-labs/suffix-array
```

## Quick start

```js
import { createSuffixArray } from '@lp-labs/suffix-array';
const index = createSuffixArray('banana');
console.log(index.suffixes()); // [5, 3, 1, 0, 4, 2]
console.log(index.lcp()); // [0, 1, 3, 0, 0, 2]
console.log(index.find('ana')); // [1, 3]
```

CommonJS exposes the same named exports:

```cjs
const api = require('@lp-labs/suffix-array');
```

## Customization

```js
import { createSuffixArray } from '@lp-labs/suffix-array';
const index = createSuffixArray('aaaa', { maxLength: 20 });
console.log(index.length, index.find('aa', 3)); // 4 [0, 1, 2]
```

## Semantics, limits and errors

`createSuffixArray(text, {maxLength})` performs actual prefix doubling: sort suffix positions by pairs of integer ranks, rerank, and double the prefix width until unique. It computes adjacent LCP by the Kasai algorithm. No complete suffix strings or n×n comparison matrix are stored. Default `maxLength=200000` UTF-16 units is a positive safe integer.

The readonly `length` excludes an empty sentinel suffix. `suffixes()` returns a fresh array of offsets in ascending UTF-16 lexicographic suffix order. `lcp()` returns an equally sized fresh array: first entry 0, each later value counts shared UTF-16 units with the preceding suffix. Empty text has two empty arrays.

`find(pattern, maxMatches=100000)` uses two binary searches for the equal-prefix range and returns matching offsets in numeric source order. Empty patterns and patterns longer than configured maxLength are rejected, not expanded to all boundaries. If the range exceeds maxMatches, RangeError is thrown before copying result offsets; no truncated result is returned. Empty indexed text yields [] for nonempty patterns.

This is literal case-sensitive UTF-16 ordering/matching, including lone surrogates and control/NUL characters; it is not Unicode collation, grapheme indexing or normalization. Invalid/oversized text/pattern throws TypeError; invalid numeric limits or excess results throw RangeError. Internal arrays are private; snapshots and matches can be mutated independently.

Sorting-based doubling costs O(n log² n) with comparison sort, LCP O(n), auxiliary rank/index/LCP storage O(n) plus engine sorting workspace. Lookup costs O(m log n + k log k), with O(k) output storage. This is not a linear-time suffix-array construction claim.

## Complete public declaration API

The following is the complete public ESM declaration surface; CommonJS has matching declarations and runtime exports. Optional properties are omitted rather than supplied as undefined under exactOptionalPropertyTypes.

```ts
export interface SuffixOptions {
  maxLength?: number;
}
export interface SuffixIndex {
  readonly length: number;
  suffixes(): number[];
  lcp(): number[];
  find(pattern: string, maxMatches?: number): number[];
}
/** Prefix-doubling suffix array with Kasai LCP; UTF-16 lexicographic order. */
export declare function createSuffixArray(text: string, options?: SuffixOptions): SuffixIndex;
```

## Development and verification

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

The offline command requires the dev tools already present in npm's cache. TypeScript ^5.9.3 and Prettier ^3.6.2 are dev-only. Build targets ES2022 with strict NodeNext declarations, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noUnused checks, ES2022/DOM libs and no ambient type packages. Runtime tests import the ESM distribution directly and check CommonJS parity. Bare-package .mts/.cts consumer tests include negative type assertions. Published files are only dist, this README, LICENSE and package.json. No publication is performed by tests.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
