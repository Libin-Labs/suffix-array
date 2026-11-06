import { createSuffixArray, type SuffixOptions, type SuffixIndex } from '@lp-labs/suffix-array';
const options: SuffixOptions = { maxLength: 100 };
const index: SuffixIndex = createSuffixArray('banana', options);
const lcp: number[] = index.lcp();
const found: number[] = index.find('ana', 10);
// @ts-expect-error source must be text
createSuffixArray(1);
// @ts-expect-error match budget must be numeric
index.find('a', '2');
void lcp;
void found;
