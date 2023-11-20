import {
  latestStreamsQuery,
  projectVersionsQuery,
  streamObjectQuery,
  streamSearchQuery,
  userInfoQuery
} from "@/graphql/speckleQueries";

import { getCategoryBasedChilds } from "../graphql/speckleQueries";
import { getSpeckleSelection } from "@/graphql/speckleVariables";

export const APP_NAME = import.meta.env.VITE_APP_SPECKLE_NAME || "speckleXYZ";
export const SERVER_URL = import.meta.env.VITE_APP_SERVER_URL || "https://speckle.xyz";
export const TOKEN = `${APP_NAME}.AuthToken`;
export const REFRESH_TOKEN = `${APP_NAME}.RefreshToken`;
export const CHALLENGE = `${APP_NAME}.Challenge`;

// TODO: Update all these to Project, Model and Version terminology.

// Redirects to the Speckle server authentication page, using a randomly generated challenge.
// Challenge will be stored to compare with when exchanging the access code.
export function goToSpeckleAuthPage() {
  // Generate random challenge.
  let challenge =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);
  // Save challenge in localStorage.
  localStorage.setItem(CHALLENGE, challenge);
  // Send user to auth page.
  window.location.href = `${SERVER_URL}/authn/verify/${import.meta.env.VITE_APP_SPECKLE_ID}/${challenge}`;
}

// Log out the current user. This removes the token/refreshToken pair.
export function speckleLogOut() {
  // Remove both token and refreshToken from localStorage
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
}

// Exchanges the provided access code with a token/refreshToken pair, and saves them to local storage.
export async function exchangeAccessCode(accessCode: string) {
  let res = await fetch(`${SERVER_URL}/auth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessCode: accessCode,
      appId: import.meta.env.VITE_APP_SPECKLE_ID,
      appSecret: import.meta.env.VITE_APP_SPECKLE_SECRET,
      challenge: localStorage.getItem(CHALLENGE),
    }),
  });
  let data = await res.json();
  if (data.token) {
    // If retrieving the token was successful, remove challenge and set the new token and refresh token
    localStorage.removeItem(CHALLENGE);
    localStorage.setItem(TOKEN, data.token);
    localStorage.setItem(REFRESH_TOKEN, data.refreshToken);
  }
  return data;
}

// Calls the GraphQL endpoint of the Speckle server with a specific query.
export async function speckleFetch(query: string, vars?: { [key: string]: any }) {
  let token = localStorage.getItem(TOKEN);
  if (token)
    try {
      let res = await fetch(`${SERVER_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: vars || null,
        }),
      });
      return await res.json();
    } catch (err) {
      console.error("API call failed", err);
    }
  else return Promise.reject("You are not logged in (token does not exist)");
}

// Fetch the current user data using the userInfoQuery
export const getUserData = () => speckleFetch(userInfoQuery);

// Fetch for streams matching the specified text using the streamSearchQuery
export const searchStreams = (variables: string) => {
  let vars = { var: variables };
  speckleFetch(streamSearchQuery, vars);
}

// Get versions related to a specific project, allows for pagination by passing a cursor
export const getProjectVersions = (projectId: string, itemsPerPage: number, cursor: Date | null) =>
  speckleFetch(projectVersionsQuery, {
    id: projectId,
    cursor,
    limit: itemsPerPage,
  });

// Get a specific object from a specific stream
export const getStreamObject = (streamId: string, objectId: string) =>
  speckleFetch(streamObjectQuery, { streamId, objectId }).then(
    (res) => res.data?.stream?.object
  );

// Get a specific object from a specific stream
export const getObject = (streamId: string, objectId: string) =>
  speckleFetch(streamObjectQuery, { streamId, objectId });

// Get the latest projects
export const getProjectsData = () => speckleFetch(latestStreamsQuery);

/**
 * Get object parameters for a stream and specific commit object.
 * The parameters will be dynamic for the sourceapplication that was used when sending to Speckle
 * @param streamId 
 * @param objectId 
 * @param sourceApplication 
 */
export const getObjectParameters = (streamId: string, objectId: string, sourceApplication: string) => {
  const selection = getSpeckleSelection(sourceApplication)
  speckleFetch(getCategoryBasedChilds, { streamId, objectId, selection });
}
