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
export function createSuffixArray(text: string, options: SuffixOptions = {}): SuffixIndex {
  const maxLength = options.maxLength ?? 200_000;
  if (!Number.isSafeInteger(maxLength) || maxLength < 1)
    throw new RangeError('Invalid length budget.');
  if (typeof text !== 'string' || text.length > maxLength)
    throw new TypeError('Invalid or oversized text.');
  const n = text.length;
  const suffixes = Array.from({ length: n }, (_, i) => i);
  let rank = Array.from({ length: n }, (_, i) => text.charCodeAt(i));
  for (let width = 1; width < n; width *= 2) {
    suffixes.sort(
      (a, b) => rank[a]! - rank[b]! || (rank[a + width] ?? -1) - (rank[b + width] ?? -1),
    );
    const next = new Array<number>(n);
    next[suffixes[0]!] = 0;
    for (let i = 1; i < n; i++) {
      const a = suffixes[i - 1]!,
        b = suffixes[i]!;
      next[b] =
        next[a]! +
        Number(rank[a] !== rank[b] || (rank[a + width] ?? -1) !== (rank[b + width] ?? -1));
    }
    rank = next;
    if (rank[suffixes[n - 1]!] === n - 1) break;
  }
  const inverse = new Array<number>(n);
  suffixes.forEach((offset, i) => {
    inverse[offset] = i;
  });
  const lcp = new Array<number>(n).fill(0);
  let common = 0;
  for (let offset = 0; offset < n; offset++) {
    const position = inverse[offset]!;
    if (position === 0) {
      common = 0;
      continue;
    }
    const previous = suffixes[position - 1]!;
    while (
      offset + common < n &&
      previous + common < n &&
      text.charCodeAt(offset + common) === text.charCodeAt(previous + common)
    )
      common++;
    lcp[position] = common;
    if (common) common--;
  }
  return {
    length: n,
    suffixes: () => [...suffixes],
    lcp: () => [...lcp],
    find(pattern, maxMatches = 100_000) {
      if (typeof pattern !== 'string' || !pattern.length || pattern.length > maxLength)
        throw new TypeError('Expected nonempty bounded pattern.');
      if (!Number.isSafeInteger(maxMatches) || maxMatches < 1)
        throw new RangeError('Invalid match budget.');
      const compare = (position: number): number => {
        const offset = suffixes[position]!;
        for (let i = 0; i < pattern.length; i++) {
          if (offset + i >= n) return -1;
          const difference = text.charCodeAt(offset + i) - pattern.charCodeAt(i);
          if (difference) return difference;
        }
        return 0;
      };
      const bound = (upper: boolean): number => {
        let low = 0,
          high = n;
        while (low < high) {
          const mid = Math.floor((low + high) / 2);
          const difference = compare(mid);
          if (difference < 0 || (upper && difference === 0)) low = mid + 1;
          else high = mid;
        }
        return low;
      };
      const low = bound(false),
        high = bound(true);
      if (high - low > maxMatches) throw new RangeError('Match budget exceeded.');
      return suffixes.slice(low, high).sort((a, b) => a - b);
    },
  };
}
