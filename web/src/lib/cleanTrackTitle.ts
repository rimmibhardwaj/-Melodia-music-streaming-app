const NOISE_PATTERNS: RegExp[] = [
  /\(official\s*(music\s*)?video\)/gi,
  /\(official\s*audio\)/gi,
  /\[official\s*(music\s*)?video\]/gi,
  /\[official\s*audio\]/gi,
  /\bofficial\s*video\b/gi,
  /\bofficial\s*audio\b/gi,
  /\bfull\s*song\b/gi,
  /\bfull\s*video\b/gi,
  /\blyrical\s*video\b/gi,
  /\blyrical\b/gi,
  /\blyrics\b/gi,
  /\bhd\b/gi,
  /\b4k\b/gi,
  /\(.*?lyric.*?\)/gi,
  /\bft\.?\s.*/gi,
  /\bfeat\.?\s.*/gi,
];

export function cleanTrackTitle(rawTitle: string): string {
  let cleaned = rawTitle;

  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  // If there's a "|" and what follows looks like a subtitle/tag 
  // (short, not part of a real song name), drop everything after it
  const pipeIndex = cleaned.indexOf("|");
  if (pipeIndex > 0) {
    cleaned = cleaned.slice(0, pipeIndex);
  }

  // Drop trailing bracketed/parenthetical junk like "(2023)" or "[Movie Name]"
  cleaned = cleaned.replace(/\s*[\(\[][^)\]]{0,40}[\)\]]\s*$/g, "");

  return cleaned.replace(/\s{2,}/g, " ").trim();
}

export interface QueryVariant {
  track: string;
  artist: string;
}

// Generates a list of progressively looser (track, artist) pairs to try
export function generateQueryVariants(
  rawTitle: string,
  channelName: string
): QueryVariant[] {
  const cleanedTitle = cleanTrackTitle(rawTitle);
  const variants: QueryVariant[] = [];

  // 1. Cleaned title + full artist/channel name
  variants.push({ track: cleanedTitle, artist: channelName });

  // 2. Cleaned title + artist with common channel suffixes stripped
  const strippedArtist = channelName
    .replace(/\b(vevo|official|music|records|studios?)\b/gi, "")
    .trim();
  if (strippedArtist && strippedArtist !== channelName) {
    variants.push({ track: cleanedTitle, artist: strippedArtist });
  }

  // 3. Title only, no artist constraint (use empty string; caller should
  //    treat empty artist as "search title-only")
  variants.push({ track: cleanedTitle, artist: "" });

  // 4. Original uncleaned title as a last resort (some entries in lrclib
  //    are indexed with messy titles too)
  variants.push({ track: rawTitle, artist: channelName });

  // De-duplicate identical variants
  const seen = new Set<string>();
  return variants.filter((v) => {
    const key = `${v.track}::${v.artist}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
