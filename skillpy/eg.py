import nltk
from nltk.corpus import wordnet as wn, stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK resources
# nltk.download('wordnet')
# nltk.download('punkt')
# nltk.download('omw-1.4')
# nltk.download('stopwords')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

# ---------------------------
# 🟢 Utility Functions
# ---------------------------
def get_user_skills():
    """Prompts user for skill input"""
    user_name = input("Enter your name: ")
    skills = input("Enter your skills (comma separated): ")
    return user_name, skills

def preprocess_skill(skill):
    """Tokenizes, removes stop words, and lemmatizes a skill"""
    tokens = word_tokenize(skill.lower())  # Tokenize and lowercase
    filtered_tokens = [lemmatizer.lemmatize(word) for word in tokens if word.isalnum() and word not in stop_words]
    return set(filtered_tokens)  # Return set of processed words

def tokenize_and_preprocess(skills):
    """Preprocesses all skills in a user's skill list"""
    return {frozenset(preprocess_skill(skill.strip())) for skill in skills.split(",")}

# ---------------------------
# 🟢 Damerau-Levenshtein Distance Function (Improved Edit Distance)
# ---------------------------
def damerau_levenshtein_distance(s1, s2):
    """Computes Damerau-Levenshtein distance (handles insertions, deletions, substitutions, and transpositions)"""
    d = {}
    len_s1, len_s2 = len(s1), len(s2)

    for i in range(-1, len_s1 + 1):
        d[(i, -1)] = i + 1
    for j in range(-1, len_s2 + 1):
        d[(-1, j)] = j + 1

    for i in range(len_s1):
        for j in range(len_s2):
            cost = 0 if s1[i] == s2[j] else 1
            d[(i, j)] = min(
                d[(i - 1, j)] + 1,  # Deletion
                d[(i, j - 1)] + 1,  # Insertion
                d[(i - 1, j - 1)] + cost  # Substitution
            )
            # Handle transposition
            if i > 0 and j > 0 and s1[i] == s2[j - 1] and s1[i - 1] == s2[j]:
                d[(i, j)] = min(d[(i, j)], d[(i - 2, j - 2)] + 1)  # Transposition

    return d[(len_s1 - 1, len_s2 - 1)]

# ---------------------------
# 🟢 Skill Similarity Matching with Partial Match Handling
# ---------------------------
def similarity_score(skill1, skill2):
    """Returns a similarity percentage (0-100) based on Damerau-Levenshtein Distance"""
    max_len = max(len(skill1), len(skill2))
    if max_len == 0:
        return 100

    distance = damerau_levenshtein_distance(skill1.lower(), skill2.lower())
    return (1 - distance / max_len) * 100  # Convert distance to similarity score

def are_synonyms(skill1, skill2):
    """Checks if two skills are synonyms using WordNet"""
    synsets1 = wn.synsets(skill1)
    synsets2 = wn.synsets(skill2)
    return any(s1 == s2 for s1 in synsets1 for s2 in synsets2)

def partial_match(skill1, skill2):
    """Returns True if one skill is a subset of another"""
    return skill1.issubset(skill2) or skill2.issubset(skill1)

# ---------------------------
# 🟢 Matching Function (Finds Best Skill Matches)
# ---------------------------
def match_users(user_skills, threshold=50):
    """Finds matches based on Damerau-Levenshtein similarity, WordNet synonyms, and partial matching"""
    matches = set()
    
    users = {user: tokenize_and_preprocess(skills) for user, skills in user_skills.items()}
    
    for user1, skills1 in users.items():
        for user2, skills2 in users.items():
            if user1 < user2:
                for skill1 in skills1:
                    for skill2 in skills2:
                        str_skill1, str_skill2 = " ".join(skill1), " ".join(skill2)
                        score = similarity_score(str_skill1, str_skill2)

                        if score > threshold:
                            matches.add((user1, user2, str_skill1, str_skill2, "damerau-levenshtein", score))
                        elif are_synonyms(str_skill1, str_skill2):
                            matches.add((user1, user2, str_skill1, str_skill2, "synonym", 100))
                        elif partial_match(skill1, skill2):
                            matches.add((user1, user2, str_skill1, str_skill2, "partial-match", 90))
    
    return matches

# ---------------------------
# 🟢 Main Program Execution
# ---------------------------
def main():
    user_skills = {}
    
    num_users = int(input("How many users are entering their skills? "))
    
    for _ in range(num_users):
        user_name, skills = get_user_skills()
        user_skills[user_name] = skills
    
    matches = match_users(user_skills)

    if matches:
        print("\nSkill Matches Found:")
        for match in matches:
            match_type = {
                "damerau-levenshtein": "via Damerau-Levenshtein",
                "synonym": "via Synonym Match",
                "partial-match": "via Partial Match"
            }[match[4]]
            print(f"{match[0]} matches with {match[1]} on skills: {match[2]} (from {match[3]})")
    else:
        print("No skill matches found.")

if __name__ == "__main__":
    main()
