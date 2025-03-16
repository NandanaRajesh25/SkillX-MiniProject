import { GraphQLClient, gql } from "graphql-request";
import { request } from 'graphql-request';

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_API_URL;
const HYGRAPH_TOKEN = process.env.NEXT_PUBLIC_HYGRAPH_API_KEY;

const client = new GraphQLClient(HYGRAPH_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${HYGRAPH_TOKEN}`,
  },
});

const UPSERT_USER_PROFILE = gql`
  mutation UpsertUserProfile(
    $email: String!,
    $UserName: String!,
    $name: String!,
    $skillString: String!,
    $userId: String!,
    $language: String!
  ) {
    upsertUserInfo(
      where: { userId: $userId } # 🔹 Ensure userId is used for upsert
      upsert: {
        create: { 
          email: $email,
          userName: $UserName,
          name: $name,
          skillString: $skillString,
          userId: $userId,
          language: $language
        }
        update: { 
          userName: $UserName,
          name: $name,
          skillString: $skillString,
          language: $language
        }
      }
    ) {
      id
      userId
      userName
      name
      email
      skillString
      language
    }

    publishUserInfo(where: { userId: $userId }) { # 🔹 Auto-publish after upsert
      id
    }
  }
`;

export const syncUserToHygraph = async (userData) => {
  if (!userData?.email || !userData?.userId) {
    console.error("Error: Email or userId is missing!");
    return;
  }

  try {
    const variables = {
      email: userData.email,
      UserName: userData.username || "Unnamed",
      name: userData.name || "Unnamed User",
      skillString: userData.skills || "No skills provided",
      userId: userData.userId, 
      language: userData.language || "English", 
    };

    console.log("Sending data to Hygraph:", variables);

    const response = await client.request(UPSERT_USER_PROFILE, variables);

    console.log("User profile synced successfully:", response);
    return response;
  } catch (error) {
    console.error("Error syncing user profile:", error.message);
    if (error.response) {
      console.error("GraphQL Response:", error.response);
    }
  }
};


const CHECK_USERNAME_EXISTS = gql`
  query CheckUsername($userName: String!) {
    userInfos(where: { userName: $userName }) {
      email
    }
  }
`;

export const checkUsernameAvailability = async (userName) => {
  try {
    const response = await client.request(CHECK_USERNAME_EXISTS, { userName });
    
    if (response?.userInfos?.length > 0) {
      return false; 
    }
    
    return true; 
  } catch (error) {
    console.error("Error checking username:", error.message);
    return false;
  }
};


const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: String!) {
  userInfos(where: { userId: $userId }) {
    id
    userId
    userName
    name
    email
    skillString
    language
    skillRequirements {
      ... on Skill {
        id
        name
      }
    }
  }
}

`;

export const fetchUserProfile = async (userId) => {
  try {
    const response = await client.request(GET_USER_PROFILE, { userId });

    console.log("Fetched profile from Hygraph:", response); 
    return response?.userInfos?.length > 0 ? response.userInfos[0] : null;
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }
};


export const fetchSkillRequests = async (userId) => {
  try {
    const profile = await fetchUserProfile(userId);
    return profile?.skillRequirements || [];
  } catch (error) {
    console.error("Error fetching skill requests:", error.message);
    return [];
  }
};

 const ADD_SKILL_REQUEST = gql`
   mutation AddSkillRequest($userId: String!, $skillName: String!) {
  updateUserInfo(
    where: { userId: $userId }
    data: { skillRequirements: { create: { Skill: { data: { name: $skillName } } } } }
  ) {
    skillRequirements {
      ... on Skill {  
        name
      }
    }
  }
    publishUserInfo(to: PUBLISHED, where: { userId: $userId }) {
    id
  }
}

 `;

 export const addSkillRequest = async (userId, skillName) => {
  console.log("Checking for existing skills...");
  
  try {
    // Fetch user profile to get existing skills
    const userProfile = await fetchUserProfile(userId);

    if (!userProfile) {
      console.error("User profile not found!");
      return { error: "User profile not found" };
    }

    const existingSkills = userProfile.skillRequirements?.map(skill => skill.name.toLowerCase()) || [];

    // Check if skill already exists
    if (existingSkills.includes(skillName.toLowerCase())) {
      console.log(`Skill '${skillName}' already exists!`);
      return { message: "Skill already exists" };
    }

    console.log(`🔹 Adding new skill: ${skillName}`);

    const response = await client.request(ADD_SKILL_REQUEST, { userId, skillName });

    console.log("Skill request added successfully:", response);
    return response;
  } catch (error) {
    console.error("Error adding skill request:", error.message);

    if (error.response) {
      console.error("GraphQL Response:", JSON.stringify(error.response, null, 2));
    }

    return null;
  }
};

const REMOVE_SKILL_FROM_USERINFO = gql`
  mutation RemoveSkillFromUserInfo($userId: String!, $skillId: ID!) {
    updateUserInfo(
      where: { userId: $userId }
      data: { skillRequirements: { disconnect: { id: $skillId } } }
    ) {
      id
      skillRequirements {
        id
        name
      }
    }
    publishUserInfo(where: { userId: $userId }) {
      id
    }
  }
`;

const DELETE_SKILL = gql`
  mutation DeleteSkillRequest($skillId: ID!) {
    deleteSkill(where: { id: $skillId }) {
      id
    }
  }
`;

export const deleteSkillRequest = async (userId, skillId) => {
  console.log("🚀 Starting deleteSkillRequest...");
  console.log("🔹 Received userId:", userId);
  console.log("🔹 Received skillId:", skillId);

  try {
    // Step 1: Remove from UserInfo
    const removeSkillResponse = await client.request(REMOVE_SKILL_FROM_USERINFO, { userId, skillId });
    console.log("✅ Skill removed from UserInfo:", removeSkillResponse);

    // Step 2: Delete from Skill model
    const deleteSkillResponse = await client.request(DELETE_SKILL, { skillId });
    console.log("✅ Skill deleted from Skill model:", deleteSkillResponse);

    return true;
  } catch (error) {
    console.error("❌ Error deleting skill:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return false;
  }
};


/** Fetch all users from Hygraph */
export const fetchUsersFromHygraph = async () => {
  const query = `
    query {
      userInfos {
        id
        userName
        skillString
        skillRequirements {
          ... on Skill {
            id
            name
          }
        }
      }
    }
  `;

  try {
    console.log("🚀 Fetching users from Hygraph...");
    const response = await client.request(query);
    console.log("✅ Users fetched successfully:", response);
    return response?.userInfos || [];
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return [];
  }
};


/** Add a match between users */
export const addMatch = async (user1, user2, skill1, skill2, score) => {
  //console.log("🚀 Storing match in Hygraph...");
  //console.log(`📌 Variables → user1: ${user1}, user2: ${user2}, skill1: ${skill1}, skill2: ${skill2}, score: ${score}`);

  const mutation = gql`
    mutation CreateMatch($user1: ID!, $user2: ID!, $skill1: String!, $skill2: String!, $score: Float!) {
      createMatch(data: {
        user1: { connect: { id: $user1 } }
        user2: { connect: { id: $user2 } }
        skill1: $skill1
        skill2: $skill2
        score: $score
      }) {
        id
      }
      publishManyMatches(to: PUBLISHED) {
        count
      }
    }
  `;

  try {
    const response = await client.request(mutation, { user1, user2, skill1, skill2, score });
    console.log("✅ Match stored successfully in Hygraph:", response);
    return response;
  } catch (error) {
    console.error("❌ Error storing match:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
  }
};


const CHECK_EXISTING_MATCH = gql`
  query CheckExistingMatch($user1: ID!, $user2: ID!, $skill1: String!, $skill2: String!, $score: Float!) {
    matches(
      where: {
        user1: { id: $user1 }
        user2: { id: $user2 }
        skill1: $skill1
        skill2: $skill2
        score: $score
      }
    ) {
      id
    }
  }
`;

/** Check if a match already exists */
export const checkExistingMatch = async (user1, user2, skill1, skill2, score) => {
  try {
    const response = await client.request(CHECK_EXISTING_MATCH, { user1, user2, skill1, skill2, score });
    
    if (response.matches.length > 0) {
      return true; // ✅ Match exists
    }

    return false; // ❌ No existing match
  } catch (error) {
    console.error("❌ Error checking existing match:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return false;
  }
};
