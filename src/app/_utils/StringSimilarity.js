//import WordNet from "wordnet";

//const wordnet = new WordNet();

/** Damerau-Levenshtein Distance Implementation */
export const damerauLevenshtein = (s1, s2) => {
  const len1 = s1.length, len2 = s2.length;
  if (!len1) return len2;
  if (!len2) return len1;

  let matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      let cost = s1[i - 1] === s2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,         // Deletion
        matrix[i][j - 1] + 1,         // Insertion
        matrix[i - 1][j - 1] + cost   // Substitution
      );

      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost); // Transposition
      }
    }
  }
  return matrix[len1][len2];
};

/** Fetch WordNet synonyms */
/** Fetch WordNet synonyms from Datamuse API */
export const getWordNetSynonyms = async (word) => {
    try {
      const response = await fetch(`https://api.datamuse.com/words?ml=${word}`);
      const data = await response.json();
      return new Set(data.map((entry) => entry.word)); // Extract synonyms
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      return new Set();
    }
  };  

/** Calculate similarity between two skill names */
export const calculateSimilarity = async (skill1, skill2) => {
  const distance = damerauLevenshtein(skill1.toLowerCase(), skill2.toLowerCase());
  const similarity = 1 - distance / Math.max(skill1.length, skill2.length);

  const synonyms1 = await getWordNetSynonyms(skill1);
  const synonyms2 = await getWordNetSynonyms(skill2);

  const synonymMatch = synonyms1.has(skill2) || synonyms2.has(skill1);
  return synonymMatch ? 1 : similarity;
};
