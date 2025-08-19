// Lightweight fuzzy search utilities: normalize, distance, and matchers
// No external dependencies to keep bundle small

// Normalize text: lowercase, trim, remove diacritics, collapse spaces, basic Uzbek apostrophes handling
export function normalizeText(str = '') {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    // remove diacritic combining marks for broader browser support
    .replace(/[\u0300-\u036f]+/g, '')
    // unify apostrophes commonly used in Uzbek transliteration
    .replace(/[ʼ’‘`′]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Basic Levenshtein distance optimized for short query vs word comparisons
export function levenshtein(a = '', b = '') {
  a = normalizeText(a);
  b = normalizeText(b);
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const v0 = new Array(bl + 1);
  const v1 = new Array(bl + 1);
  for (let i = 0; i <= bl; i++) v0[i] = i;

  for (let i = 0; i < al; i++) {
    v1[0] = i + 1;
    const ac = a.charCodeAt(i);
    for (let j = 0; j < bl; j++) {
      const cost = ac === b.charCodeAt(j) ? 0 : 1;
      v1[j + 1] = Math.min(
        v1[j] + 1,        // insertion
        v0[j + 1] + 1,    // deletion
        v0[j] + cost      // substitution
      );
    }
    for (let j = 0; j <= bl; j++) v0[j] = v1[j];
  }
  return v1[bl];
}

// Tokenize a string into words for better fuzzy scoring on product names
function tokenize(str = '') {
  return normalizeText(str)
    .split(/[^a-z0-9а-яёўқғҳʼ']+/u)
    .filter(Boolean);
}

// Compute a fuzzy score for a product relative to the query.
// Lower is better (distance). We use min distance across tokens and fields.
export function scoreProduct(product, query) {
  const fields = [
    product?.name,
    product?.title,
    product?.model,
    product?.description,
    Array.isArray(product?.badges) ? product.badges.join(' ') : product?.badge,
    product?.category,
    product?.brand
  ].filter(Boolean);

  if (fields.length === 0) return { distance: Number.POSITIVE_INFINITY, term: '' };

  const q = normalizeText(query);
  let best = { distance: Number.POSITIVE_INFINITY, term: '' };

  for (const field of fields) {
    const tokens = tokenize(field);
    for (const token of tokens) {
      // Early exact/startsWith boost
      if (token.startsWith(q)) {
        const d = Math.abs(token.length - q.length) * 0.1; // light length penalty
        if (d < best.distance) best = { distance: d, term: token };
        continue;
      }
      if (token.includes(q)) {
        const d = Math.abs(token.length - q.length) * 0.3;
        if (d < best.distance) best = { distance: d + 0.5, term: token };
        continue;
      }
      const d = levenshtein(q, token);
      if (d < best.distance) best = { distance: d, term: token };
    }
  }
  return best;
}

// Get top-N fuzzy matches from a list of products
export function getFuzzyMatches(products = [], query, limit = 12) {
  if (!query || !Array.isArray(products) || products.length === 0) return [];
  const scored = products.map((p) => ({ product: p, ...scoreProduct(p, query) }));
  // Filter clearly irrelevant results using a dynamic threshold by query length
  const qLen = normalizeText(query).length || 1;
  const maxAllowed = Math.max(2, Math.ceil(qLen * 0.6));
  return scored
    .filter((s) => isFinite(s.distance) && s.distance <= maxAllowed)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// Derive "Did you mean" terms from top fuzzy matches
export function getDidYouMeanTerms(matches = [], limit = 5) {
  const map = new Map();
  for (const m of matches) {
    const key = m.term;
    if (!key) continue;
    const prev = map.get(key) || { term: key, weight: 0 };
    // Heavier weight for closer distance
    prev.weight += 1 / (1 + m.distance);
    map.set(key, prev);
  }
  return Array.from(map.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((x) => x.term);
}
