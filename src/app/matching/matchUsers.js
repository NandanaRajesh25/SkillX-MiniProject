import { fetchUsersFromHygraph, addMatch, checkExistingMatch } from "../_utils/GlobalApi";
import { damerauLevenshtein } from "../_utils/StringSimilarity";
import { lemmatizeWords } from "../_utils/Lemmatizer";

const stopwords = new Set(["i", "me", "my", "myself", "we", "our", "ours", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "they", "them", "their", "theirs", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "having", "do", "does", "did", "doing", "a", "an", "the", "and",
  "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between",
  "into", "through", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off"]);

const threshold = 0.7;

/** Preprocess skills: split, remove stopwords, and lemmatize */
async function preprocessSkills(skillString) {
  if (!skillString) return [];

  const skills = skillString
    .toLowerCase()
    .split(",") // Split by commas
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0 && !stopwords.has(skill));

  return await lemmatizeWords(skills);
}

export const matchUsers = async () => {
  console.log("🚀 Running skill matching...");

  try {
    const users = await fetchUsersFromHygraph();
    console.log("✅ Users fetched from Hygraph:", users.length);

    if (!users || users.length < 2) {
      console.warn("⚠️ Not enough users to match.");
      return;
    }

    const matchedPairs = new Set();

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];

        //console.log(`🔹 Comparing ${user1.userName} ↔️ ${user2.userName}`);

        const user1Skills = await preprocessSkills(user1.skillString);
        const user2Skills = await preprocessSkills(user2.skillString);
        const user1Requirements = user1.skillRequirements.map(skill => skill.name.toLowerCase());
        const user2Requirements = user2.skillRequirements.map(skill => skill.name.toLowerCase());

        let bestMatch = null;
        let highestScore = 0;

        // 🔹 Check similarity in both directions
        for (const skillReq1 of user1Requirements) {
          for (const skillOffered2 of user2Skills) {
            const score1 = 1 - damerauLevenshtein(skillReq1, skillOffered2) / Math.max(skillReq1.length, skillOffered2.length);

            for (const skillReq2 of user2Requirements) {
              for (const skillOffered1 of user1Skills) {
                const score2 = 1 - damerauLevenshtein(skillReq2, skillOffered1) / Math.max(skillReq2.length, skillOffered1.length);
                
                // ✅ Take average of the two similarity scores
                const finalScore = (score1 + score2) / 2;

                //console.log(`   🔄 ${user1.userName} wants '${skillReq1}' & ${user2.userName} wants '${skillReq2}' → Score: ${finalScore}`);

                if (score1 >= threshold && score2 >= threshold && finalScore > highestScore) {
                  bestMatch = { user1: user1.id, user2: user2.id, skill1: skillReq1, skill2: skillReq2, score: finalScore };
                  highestScore = finalScore;
                }
              }
            }
          }
        }

        if (bestMatch) {
          const pairKey = [bestMatch.user1, bestMatch.user2].sort().join("_");

          if (!matchedPairs.has(pairKey)) {
            // ✅ Check if match already exists
            const exists = await checkExistingMatch(bestMatch.user1, bestMatch.user2, bestMatch.skill1, bestMatch.skill2, bestMatch.score);

            if (exists) {
              console.log(`⚠️ Duplicate match exists in Hygraph. Skipping: ${user1.userName} ↔️ ${user2.userName}`);
            } else {
              console.log(`✅ Storing Match: ${user1.userName} wants '${bestMatch.skill1}' ↔️ ${user2.userName} wants '${bestMatch.skill2}' (Score: ${bestMatch.score})`);
              
              await addMatch(bestMatch.user1, bestMatch.user2, bestMatch.skill1, bestMatch.skill2, bestMatch.score);
              matchedPairs.add(pairKey);
            }
          } else {
            console.log(`⚠️ Duplicate match detected locally, skipping: ${user1.userName} ↔️ ${user2.userName}`);
          }
        }
      }
    }

    console.log("🎉 Skill matching completed!");
  } catch (error) {
    console.error("❌ Error during skill matching:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
  }
};
