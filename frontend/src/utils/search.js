/**
 * Search normalization, matching, and suggestion utilities for OpportuneX.
 */

/**
 * Normalizes input text by trimming, collapsing spaces, and converting to lowercase.
 */
export function normalizeText(str) {
  if (!str) return ''
  return String(str).toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Generates stem and plural/singular variants for flexible text matching.
 * e.g., "hacks" -> ["hacks", "hack"], "workshops" -> ["workshops", "workshop"]
 */
export function getStemVariants(token) {
  const norm = normalizeText(token)
  if (!norm) return []
  const variants = new Set([norm])

  // Plural/singular 's'
  if (norm.endsWith('s') && norm.length > 3) {
    variants.add(norm.slice(0, -1))
  }
  // Plural 'es' (e.g. hackathons/competitions/fishes/boxes)
  if (norm.endsWith('es') && norm.length > 4) {
    variants.add(norm.slice(0, -2))
  }
  // 'ies' -> 'y' (e.g. categories -> category)
  if (norm.endsWith('ies') && norm.length > 4) {
    variants.add(norm.slice(0, -3) + 'y')
  }
  // 'ing' (e.g. coding -> code, learning -> learn)
  if (norm.endsWith('ing') && norm.length > 5) {
    variants.add(norm.slice(0, -3))
  }

  return Array.from(variants)
}

/**
 * Checks if a single token matches inside the event text corpus.
 */
function tokenMatchesCorpus(token, corpus, wordsInCorpus) {
  const variants = getStemVariants(token)

  // 1. Direct substring match with any variant
  for (const v of variants) {
    if (corpus.includes(v)) return true
  }

  // 2. Prefix or stem match against individual words in corpus
  for (const word of wordsInCorpus) {
    for (const v of variants) {
      if (word.startsWith(v) || (v.length >= 4 && word.includes(v))) {
        return true
      }
      // Also check if word stems match token (e.g. word "hackathons" vs token "hack")
      const wordVariants = getStemVariants(word)
      if (wordVariants.some((wv) => wv.startsWith(v) || v.startsWith(wv))) {
        return true
      }
    }
  }

  return false
}

/**
 * Checks if an event matches a search query across all relevant fields:
 * Title, Category, Organizer name/subtitle, Venue, Description, Tags.
 */
export function matchEvent(event, rawQuery) {
  const query = normalizeText(rawQuery)
  if (!query) return true
  if (!event) return false

  const fields = [
    event.title,
    event.category,
    event.organizer?.name,
    event.organizer?.subtitle,
    event.venue,
    event.description,
    ...(Array.isArray(event.tags) ? event.tags : [])
  ]
    .filter(Boolean)
    .join(' ')

  const corpus = normalizeText(fields)
  const wordsInCorpus = corpus.split(' ').filter(Boolean)

  // Full query direct match shortcut
  if (corpus.includes(query)) return true

  // Token-based matching: all tokens in the query must match something in the corpus
  const queryTokens = query.split(' ').filter(Boolean)
  if (queryTokens.length === 0) return true

  return queryTokens.every((token) => tokenMatchesCorpus(token, corpus, wordsInCorpus))
}

/**
 * Dynamically computes search suggestions based on real event data.
 * Returns up to maxResults suggestions with label, category, and match type.
 */
export function getSearchSuggestions(events = [], rawQuery = '', maxResults = 6) {
  const query = normalizeText(rawQuery)
  if (!query || query.length === 0) return []

  const queryVariants = getStemVariants(query)
  const suggestionsMap = new Map()

  // Collect candidate strings from events
  const candidates = []

  // 1. Categories
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)))
  for (const cat of categories) {
    candidates.push({ text: cat, type: 'Category', category: cat, priority: 1 })
  }

  // 2. Event Titles
  for (const ev of events) {
    if (ev.title) {
      candidates.push({ text: ev.title, type: 'Event', category: ev.category, priority: 2 })
    }
  }

  // 3. Organizers
  for (const ev of events) {
    if (ev.organizer?.name) {
      candidates.push({ text: ev.organizer.name, type: 'Organizer', category: ev.category, priority: 3 })
    }
  }

  // 4. Tags
  for (const ev of events) {
    if (Array.isArray(ev.tags)) {
      for (const tag of ev.tags) {
        candidates.push({ text: tag, type: 'Tag', category: ev.category, priority: 4 })
      }
    }
  }

  // Filter & score candidates
  for (const cand of candidates) {
    const normText = normalizeText(cand.text)
    if (!normText) continue

    let score = -1

    // Exact match
    if (normText === query) {
      score = 100
    }
    // Starts with query
    else if (normText.startsWith(query)) {
      score = 80 - cand.priority
    }
    // Any variant starts with or matches
    else if (queryVariants.some((v) => normText.startsWith(v))) {
      score = 70 - cand.priority
    }
    // Word inside starts with query
    else if (normText.split(' ').some((w) => w.startsWith(query) || queryVariants.some((v) => w.startsWith(v)))) {
      score = 60 - cand.priority
    }
    // Substring match
    else if (normText.includes(query) || queryVariants.some((v) => normText.includes(v))) {
      score = 40 - cand.priority
    }

    if (score > 0) {
      const key = normText
      if (!suggestionsMap.has(key) || suggestionsMap.get(key).score < score) {
        suggestionsMap.set(key, { ...cand, score })
      }
    }
  }

  // Sort by score descending and return top maxResults
  const sorted = Array.from(suggestionsMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  return sorted
}
