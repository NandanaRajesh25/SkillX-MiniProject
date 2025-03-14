from sentence_transformers import SentenceTransformer, util

# Load a pre-trained SBERT model
model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight & fast

# Sample user skills
user1_skills = ["python coding", "data science", "machine learning"]
user2_skills = ["java coding", "deep learning", "software development"]

# Encode skills into vectors
user1_embeddings = model.encode(user1_skills, convert_to_tensor=True)
user2_embeddings = model.encode(user2_skills, convert_to_tensor=True)

# Compute similarity scores
similarity_matrix = util.pytorch_cos_sim(user1_embeddings, user2_embeddings)

# Display results
for i, skill1 in enumerate(user1_skills):
    for j, skill2 in enumerate(user2_skills):
        similarity_score = similarity_matrix[i][j].item()
        if similarity_score > 0.75: 
            print(f"Match found: {skill1} ↔ {skill2} (Similarity: {similarity_score:.2f})")
