import { GraphQLClient, gql } from "graphql-request";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_API_URL;
const HYGRAPH_TOKEN = process.env.NEXT_PUBLIC_HYGRAPH_API_KEY;

const client = new GraphQLClient(HYGRAPH_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${HYGRAPH_TOKEN}`,
  },
});

// GraphQL Mutation to Upsert User (Create or Update)
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
      where: { email: $email }
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
      userName
      name
      skillString
      userId
      language
    }
  }
`;

// Function to Sync (Create or Update) User in Hygraph
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
      userId: userData.userId, // Extracted from Clerk
      language: userData.language || "English", // Default to English
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
      return false; // Username already exists
    }
    
    return true; // Username is available
  } catch (error) {
    console.error("Error checking username:", error.message);
    return false;
  }
};
