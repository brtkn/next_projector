import { ProjectForm, UserProfile } from "@/common.types";
import {
  createProjectMutation,
  createUserMutation,
  deleteProjectMutation,
  getProjectByIdQuery,
  getProjectsOfUserQuery,
  getUserQuery,
  projectsQuery,
  updateProjectMutation,
} from "@/graphql";
import { GraphQLClient } from "graphql-request";

// If the value of NODE_ENV is set to "production", the expression evaluates to true otherwise false.
const isProduction = process.env.NODE_ENV === "production";

const apiUrl = isProduction
  ? process.env.NEXT_PUBLIC_GRAFBASE_API_URL || ""
  : " http://127.0.0.1:4000/graphql";

const apiKey = isProduction
  ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || ""
  : "letmein";

const serverUrl = isProduction
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : "http://localhost:3000";

const client = new GraphQLClient(apiUrl);

const makeGraphQLRequest = async (query: string, variables = {}) => {
  try {
    return await client.request(query, variables);
  } catch (error) {
    throw error;
  }
};

export const getUser = (email: string) => {
  client.setHeader("x-api-key", apiKey);
  return makeGraphQLRequest(getUserQuery, { email });
};

export const createUser = (name: string, email: string, avatarUrl: string) => {
  client.setHeader("x-api-key", apiKey);

  const variables = {
    input: {
      name: name,
      email: email,
      avatarUrl: avatarUrl,
    },
  };

  return makeGraphQLRequest(createUserMutation, variables);
};

// TOKEN
export const fetchToken = async () => {
  try {
    const response = await fetch(`${serverUrl}/api/auth/token`);
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const uploadImage = async (imagePath: string) => {
  try {
    const response = await fetch(`${serverUrl}/api/upload`, {
      method: "POST",
      body: JSON.stringify({ path: imagePath }),
    });
    //returns the published url of the image on the cloudinary server
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const createNewProject = async (
  form: ProjectForm,
  createrId: string,
  token: string
) => {
  const imageUrl = await uploadImage(form.image);

  if (imageUrl.url) {
    client.setHeader("Authorization", `Bearer ${token}`);

    const variables = {
      input: {
        ...form,
        image: imageUrl.url,
        createdBy: {
          link: createrId,
        },
      },
    };
    return makeGraphQLRequest(createProjectMutation, variables);
  }
};

export const fetchAllProjects = async (
  category?: string | null,
  endcursor?: string | null
) => {
  client.setHeader("x-api-key", apiKey);

  // Conditionally add the category variable to the GraphQL request
  const variables = category ? { category, endcursor } : { endcursor };

  return makeGraphQLRequest(projectsQuery, variables);
};

export const getProjectDetails = (id: string) => {
  client.setHeader("x-api-key", apiKey);

  return makeGraphQLRequest(getProjectByIdQuery, { id });
};

export const getUserProjects = (id: string, last?: number) => {
  client.setHeader("x-api-key", apiKey);

  return makeGraphQLRequest(getProjectsOfUserQuery, { id, last });
};

export const deleteProject = (id: string, token: string) => {
  client.setHeader("Authorization", `Bearer ${token}`);

  return makeGraphQLRequest(deleteProjectMutation, { id });
};

export const updateProject = async (
  form: ProjectForm,
  projectId: string,
  token: string
) => {
  // New image or not. If it is cloudinary it is an old upload. If it is base64 it is a new upload.
  function isBase64DataURL(value: string) {
    const base64Regex = /^data:image\/[a-z]+;base64,/;
    return base64Regex.test(value);
  }

  let updatedForm = { ...form };
  const isUploadingNewImage = isBase64DataURL(form.image);

  if (isUploadingNewImage) {
    const imageUrl = await uploadImage(form.image);

    if (imageUrl.url) {
      updatedForm = {
        ...form,
        image: imageUrl.url,
      };
    }
  }

  const variables = {
    id: projectId,
    input: updatedForm,
  };

  client.setHeader("Authorization", `Bearer ${token}`);

  return makeGraphQLRequest(updateProjectMutation, variables);
};
