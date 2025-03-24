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
    imageUrl
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
        imageUrl
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
        accept1: false
        accept2: false
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

const GET_USER_INFO_ID = gql`
  query GetUserInfoId($userId: String!) {
    userInfos(where: { userId: $userId }) {
      id
    }
  }
`;

export const fetchUserInfoId = async (userId) => {
  try {
    const response = await client.request(GET_USER_INFO_ID, { userId });
    return response.userInfos.length ? response.userInfos[0].id : null;
  } catch (error) {
    console.error("❌ Error fetching UserInfo ID:", error.message);
    return null;
  }
};

const FETCH_USER_MATCHES = gql`
  query FetchUserMatches($userId: ID!) {
    matches(
      where: {
        OR: [
          { user1: { id: $userId } }
          { user2: { id: $userId } }
        ]
          accept1: false
          accept2: false
      }
    ) {
      id
      user1 { id userId userName }
      user2 { id userId userName }
      skill1
      skill2
      score
      accept1
      accept2
    }
  }
`;

export const fetchUserMatches = async (userId) => {
  if (!userId) {
    console.error("❌ fetchUserMatches: userId is missing!");
    return [];
  }

  try {
    console.log("🔍 Fetching UserInfo ID for userId:", userId);
    const userInfoId = await fetchUserInfoId(userId);

    if (!userInfoId) {
      console.error("❌ No UserInfo ID found for userId:", userId);
      return [];
    }

    console.log("✅ Found UserInfo ID:", userInfoId);
    
    console.log("📡 Sending query to fetch matches for UserInfo ID:", userInfoId);
    const response = await client.request(FETCH_USER_MATCHES, { userId: userInfoId });

    console.log("✅ Response from Hygraph:", response);
    return response.matches || [];
  } catch (error) {
    console.error("❌ Error fetching user matches:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return [];
  }
};

const UPDATE_MATCH_ACCEPTANCE = gql`
  mutation UpdateMatchAcceptance($matchId: ID!, $field: MatchUpdateInput!) {
    updateMatch(where: { id: $matchId }, data: $field) {
      id
      accept1
      accept2
    }
    publishMatch(where: { id: $matchId }) {
      id
    }
  }
`;

export const updateMatchAcceptance = async (matchId, field) => {
  try {
    const variables = { matchId, field: { [field]: true } };
    console.log("📡 Sending request to update match:", variables);

    const response = await client.request(UPDATE_MATCH_ACCEPTANCE, variables);
    console.log("✅ Match updated:", response);
    return true;
  } catch (error) {
    console.error("❌ Error updating match:", error.message);
    return false;
  }
};


const FETCH_HALF_CONFIRMED_MATCHES = gql`
  query FetchConfirmedMatches($userId: ID!) {
    matches(
      where: {
        OR: [
          { user1: { id: $userId }, accept2: true, accept1:false }
          { user2: { id: $userId }, accept1: true, accept2:false }
        ]
      }
    ) {
      id
      user1 { id userId userName }
      user2 { id userId userName }
      skill1
      skill2
      score
    }
  }
`;

export const fetchHalfConfirmedMatches = async (userId) => {
  if (!userId) {
    console.error("❌ fetchConfirmedMatches: userId is missing!");
    return [];
  }

  try {
    console.log("🔍 Fetching UserInfo ID for userId:", userId);
    const userInfoId = await fetchUserInfoId(userId);

    if (!userInfoId) {
      console.error("❌ No UserInfo ID found for userId:", userId);
      return [];
    }

    console.log("✅ Found UserInfo ID:", userInfoId);

    console.log("📡 Sending query to fetch confirmed matches for UserInfo ID:", userInfoId);
    const response = await client.request(FETCH_HALF_CONFIRMED_MATCHES, { userId: userInfoId });

    console.log("✅ Confirmed matches fetched:", response);
    return response.matches || [];
  } catch (error) {
    console.error("❌ Error fetching confirmed matches:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return [];
  }
};

const COMPLETE_ACCEPT = gql`
  mutation CompleteAccept($matchId: ID!) {
    updateMatch(
      where: { id: $matchId }
      data: { accept1: true, accept2: true }
    ) {
      id
      accept1
      accept2
    }
    publishMatch(where: { id: $matchId }) {
      id
    }
  }
`;

export const completeAcceptMatch = async (matchId) => {
  try {
    console.log("📡 Sending request to mark match as fully accepted:", matchId);
    
    const response = await client.request(COMPLETE_ACCEPT, { matchId });
    console.log("✅ Match fully accepted:", response);
    
    return true;
  } catch (error) {
    console.error("❌ Error completing match acceptance:", error.message);
    return false;
  }
};


const FETCH_CONFIRMED_LEARNING_MATCHES = gql`
  query FetchConfirmedLearningMatches($userId: ID!) {
    matches(
      where: {
        OR: [
          { user1: { id: $userId } }
          { user2: { id: $userId } }
        ]
        accept1: true
        accept2: true
      }
    ) {
      id
      user1 { id userId userName }
      user2 { id userId userName }
      skill1
      skill2
      score
    }
  }
`;

export const fetchConfirmedLearningMatches = async (userId) => {
  if (!userId) {
    console.error("❌ fetchConfirmedLearningMatches: userId is missing!");
    return [];
  }

  try {
    console.log("🔍 Fetching UserInfo ID for userId:", userId);
    const userInfoId = await fetchUserInfoId(userId);

    if (!userInfoId) {
      console.error("❌ No UserInfo ID found for userId:", userId);
      return [];
    }

    console.log("✅ Found UserInfo ID:", userInfoId);
    console.log("📡 Sending query to fetch confirmed learning matches...");
    
    const response = await client.request(FETCH_CONFIRMED_LEARNING_MATCHES, { userId: userInfoId });

    console.log("✅ Confirmed learning matches fetched:", response);
    return response.matches || [];
  } catch (error) {
    console.error("❌ Error fetching confirmed learning matches:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return [];
  }
};


const CHECK_USER_CHAT = gql`
  query CheckUserChat($matchId: ID!) {
    userChats(where: { match: { id: $matchId } }) {
      id
    }
  }
`;

const CREATE_USER_CHAT = gql`
  mutation CreateUserChat($matchId: ID!, $user1: ID!, $user2: ID!) {
    createUserChat(
      data: { match: { connect: { id: $matchId } }, user1: { connect: { id: $user1 } }, user2: { connect: { id: $user2 } } }
    ) {
      id
    }
    publishManyUserChats(to: PUBLISHED) {
      count
    }
  }
`;

export const checkOrCreateUserChat = async (matchId, user1, user2) => {
  try {
    console.log("📡 Checking for existing UserChat...");
    const response = await client.request(CHECK_USER_CHAT, { matchId });

    if (response.userChats.length > 0) {
      console.log("✅ UserChat already exists:", response.userChats[0].id);
      return response.userChats[0].id;
    }

    console.log("🛠 No UserChat found. Creating one...");
    const createResponse = await client.request(CREATE_USER_CHAT, { matchId, user1, user2 });

    console.log("✅ UserChat created successfully:", createResponse);
    return createResponse.createUserChat.id;
  } catch (error) {
    console.error("❌ Error checking/creating UserChat:", error.message);
    throw error;
  }
};


const FETCH_MATCH_DETAILS = gql`
  query FetchMatch($matchId: ID!) {
    match(where: { id: $matchId }) {
      id
      skill1
      skill2
      user1 { id userId userName name }
      user2 { id userId userName name }
    }
  }
`;

export const fetchMatchDetails = async (matchId) => {
  try {
    const response = await client.request(FETCH_MATCH_DETAILS, { matchId });
    return response.match;
  } catch (error) {
    console.error("Error fetching match details:", error);
    return null;
  }
};

const FETCH_CHAT = gql`
  query FetchChat($matchId: ID!) {
    userChats(where: { match: { id: $matchId } }) {
      id
      messages {
        ... on Message {  # 👈 Explicitly query Message type
          content
          timeStamp
          sender { id userId userName }
        }
      }
    }
  }
`;

export const fetchChat = async (matchId) => {
  try {
    //console.log("📡 Fetching chat for match ID:", matchId);
    const response = await client.request(FETCH_CHAT, { matchId });

    if (response.userChats.length === 0) {
      console.warn("⚠️ No chat found for match ID:", matchId);
      return null;
    }

    //console.log("✅ Chat fetched successfully:", response.userChats[0]);
    return response.userChats[0];
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    return null;
  }
};

const GET_USER_CHAT_ID = gql`
  query GetUserChatId($matchId: ID!) {
    userChats(where: { match: { id: $matchId } }) {
      id
    }
  }
`;

const GET_USERINFO_ID = gql`
  query GetUserInfoId($userId: String!) {
    userInfos(where: { userId: $userId }) {
      id
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $senderId: ID!, $content: String!, $timeStamp: DateTime!) {
    updateUserChat(
      where: { id: $chatId }
      data: { messages: { 
        create: { 
          Message: { 
            data: { 
              content: $content, 
              sender: { connect: { id: $senderId } },
              timeStamp: $timeStamp  
            } 
          } 
        } 
      } } 
    ) {
      id
    }
    publishUserChat(where: { id: $chatId }) { 
      id
    }
  }
`;

export const sendMessage = async (matchId, senderId, content) => {
  try {
    console.log("🔍 Fetching UserChat ID for match:", matchId);
    const chatResponse = await client.request(GET_USER_CHAT_ID, { matchId });

    if (!chatResponse.userChats.length) {
      console.error("❌ No UserChat found for this match.");
      return null;
    }

    const chatId = chatResponse.userChats[0].id;
    console.log("✅ Found UserChat ID:", chatId);

    // ✅ Fetch Hygraph UserInfo ID (Convert Clerk's `userId` to Hygraph's `id`)
    console.log("🔍 Fetching Hygraph UserInfo ID for sender:", senderId);
    const userInfoResponse = await client.request(GET_USERINFO_ID, { userId: senderId });

    if (!userInfoResponse.userInfos.length) {
      console.error("❌ No Hygraph UserInfo found for sender.");
      return null;
    }

    const hygraphSenderId = userInfoResponse.userInfos[0].id;
    console.log("✅ Found Hygraph senderId:", hygraphSenderId);

    // ✅ Ensure timestamp is in correct format → "YYYY-MM-DDTHH:mm:ssZ"
    const now = new Date();
    const timeStamp = now.toISOString().split(".")[0] + "Z"; // Remove milliseconds

    console.log("📡 Sending message:", { chatId, senderId: hygraphSenderId, content, timeStamp });

    const response = await client.request(SEND_MESSAGE, { chatId, senderId: hygraphSenderId, content, timeStamp });

    console.log("✅ Message sent and published successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return null;
  }
};

const FETCH_FILES = gql`
  query FetchFiles($chatId: ID!) {
    userChat(where: { id: $chatId }) {
      files {
        ... on File {
          name
          description
          theFile
        }
      }
    }
  }
`;

export const fetchFiles = async (chatId) => {
  try {
    console.log("📡 Fetching files for chat:", chatId);
    const response = await client.request(FETCH_FILES, { chatId });
    console.log("✅ Files fetched successfully:", response);
    return response.userChat?.files || [];
  } catch (error) {
    console.error("❌ Error fetching files:", error.message);
    if (error.response) {
      console.error("📡 GraphQL Response:", JSON.stringify(error.response, null, 2));
    }
    return [];
  }
};

///////

const ATTACH_FILE_TO_CHAT = gql`
  mutation MyMutation(
    $chatId: ID!
    $description: String!
    $name: String!
    $theFile: String!
  ) {
    updateUserChat(
      where: { id: $chatId }
      data: {
        files: {
          create: {
            File: {
              data: { description: $description, name: $name, theFile: $theFile }
            }
          }
        }
      }
    ) {
      id
      files {
        ... on File {
          id
          name
        }
      }
    }

    publishManyFilesConnection(
      where: { name: $name }
      to: PUBLISHED
    ) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const uploadToCloudinary = async (theFile) => {
  try {
    const formData = new FormData();
    formData.append("file", theFile);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); // Set your Cloudinary upload preset

    console.log("📡 Uploading file to Cloudinary...");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to upload file to Cloudinary");
    }

    console.log("✅ File uploaded to Cloudinary:", data.secure_url);
    return data; // Returns { secure_url, public_id, etc. }
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    return null;
  }
};

export const uploadFileToChat = async (chatId, fileUrl, name, description) => {
  try {
    // console.log("📡 Uploading file to Cloudinary...");
    // const cloudinaryResponse = await uploadToCloudinary(theFile);

    // if (!cloudinaryResponse) {
    //   console.error("❌ Cloudinary upload failed.");
    //   return false;
    // }

    // const fileUrl = cloudinaryResponse.secure_url;
    // console.log("✅ File uploaded to Cloudinary:", fileUrl);

    console.log("📡 Attaching file to UserChat...");
    const chatResponse = await client.request(ATTACH_FILE_TO_CHAT, {
      chatId,
      description,
      name,
      theFile: fileUrl,
    });

    console.log(chatResponse);

    console.log("✅ File successfully attached to chat:", chatResponse);
    return true;
  } catch (error) {
    console.error("❌ Error attaching file to chat:", error);
    return false;
  }
};

const UPDATE_PROFILE_PICTURE = gql`
  mutation UpdateProfilePicture($userId: String!, $imageUrl: String!) {
    updateUserInfo(
      where: { userId: $userId }
      data: { imageUrl: $imageUrl }
    ) {
      id
      imageUrl
    }
    publishUserInfo(where: { userId: $userId }) {
      id
    }
  }
`;

export const uploadProfilePictureToHygraph = async (userId, imageUrl) => {
  try {
    console.log("📡 Updating profile picture in Hygraph...");

    const response = await client.request(UPDATE_PROFILE_PICTURE, {
      userId,
      imageUrl,
    });

    console.log("✅ Profile picture updated in Hygraph:", response);
    return response;
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);
    return null;
  }
};
