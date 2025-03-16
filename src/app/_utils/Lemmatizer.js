export async function loadLemmas() {
    try {
      const response = await fetch("/lemmas.json"); // Load from public folder
      const lemmas = await response.json();
      return lemmas;
    } catch (error) {
      console.error("❌ Error loading lemmas:", error);
      return {};
    }
  }
  
  /** Function to lemmatize words using `lemmas.json` */
  export async function lemmatizeWord(word) {
    const lemmas = await loadLemmas();
    return lemmas[word.toLowerCase()] || word; // Return lemma if found, else return the word itself
  }
  
  /** Function to lemmatize an array of words */
  export async function lemmatizeWords(words) {
    const lemmas = await loadLemmas();
    return words.map((word) => lemmas[word.toLowerCase()] || word);
  }
  