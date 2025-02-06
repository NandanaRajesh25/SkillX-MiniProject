import { GraphQLClient, gql } from "graphql-request";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_API_URL;
const HYGRAPH_TOKEN = process.env.NEXT_PUBLIC_HYGRAPH_API_KEY;

// Initialize GraphQL Client
const client = new GraphQLClient(HYGRAPH_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${HYGRAPH_TOKEN}`,
  },
});

// GraphQL Mutation to Upsert User
const UPSERT_USER = gql`
  mutation UpsertUser($email: String!, $UserName: String!) {
    upsertUserInfo(
      where: { email: $email }
      upsert: {
        create: { email: $email, userName: $UserName }
        update: { userName: $UserName }
      }
    ) {
      id
    }
  }
`;

// GraphQL Mutation to Create User Profile
const CREATE_USER_PROFILE = gql`
  mutation CreateUserProfile($userName: String!, $email: String!, $name: String!, $skillString: String!) {
    createUserInfo(data: {
      userName: $userName,
      email: $email,
      name: $name,
      skillString: $skillString
    }) {
      id
    }
  }
`;

// Function to Sync User to Hygraph
export const syncUserToHygraph = async (user) => {
  if (!user?.emailAddresses?.[0]?.emailAddress) {
    console.error("Error: Email is missing!");
    return;
  }

  try {
    const response = await client.request(UPSERT_USER, {
      email: user.emailAddresses[0].emailAddress, // ✅ Fetch email correctly
      UserName: user.name || "Unnamed",
    });
    return response;
  } catch (error) {
    console.error("Error syncing user to Hygraph:", error);
  }
};

// Function to Create User Profile
export const createUserProfile = async (userData) => {
  try {
    console.log("Raw userData before formatting:", userData);

    const formattedName = userData.name?.trim() || "Unnamed User"; 
    const formattedSkillString = userData.skills?.trim() || "No skills provided";

    const variables = {
      userName: userData.username,
      email: userData.email,
      name: formattedName,
      skillString: formattedSkillString,
    };

    console.log("Variables being sent to Hygraph:", variables);

    if (!variables.userName || !variables.email || !variables.name) {
      throw new Error("Missing required fields: userName, email, or name.");
    }

    // ✅ Corrected: Use `client.request()` instead of `request()`
    const response = await client.request(CREATE_USER_PROFILE, variables);

    console.log("Profile created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating profile:", error.message);
    if (error.response) {
      console.error("GraphQL Response:", error.response);
    }
  }
};