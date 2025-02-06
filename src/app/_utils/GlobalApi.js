// /app/_utils/GlobalApi.js
import { GraphQLClient, gql } from "graphql-request";

const HYGRAPH_ENDPOINT = process.env.HYGRAPH_API_URL;
const HYGRAPH_TOKEN = process.env.NEXT_PUBLIC_HYGRAPH_API_KEY;

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
  try {
    await client.request(UPSERT_USER, {
      email: user.email,
      UserName: user.name || "Unnamed",
    });
  } catch (error) {
    console.error("Error syncing user to Hygraph:", error);
  }
};

// Function to Create User Profile
export const createUserProfile = async (userData) => {
  try {
    await client.request(CREATE_USER_PROFILE, {
      userName: userData.username,
      email: userData.email,
      name: userData.name,
      skillString: userData.skills,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
  }
};
