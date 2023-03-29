import {
  streamObjectQuery,
  getCategoryBasedChilds,
} from "@/components/materialMapper/shared/graphql/speckleQueries";

// Calls the GraphQL endpoint of the Speckle server with a specific query.
export async function speckleFetch(query, vars) {
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

export const getStreamObject = (streamId, objectId) =>
  speckleFetch(streamObjectQuery, { streamId, objectId }).then(
    (res) => res.data?.stream?.object
  );

export const getObject = (streamId, objectId) =>
  speckleFetch(streamObjectQuery, { streamId, objectId });

export const getCategoryAndChilds = (streamId, objectId) =>
  speckleFetch(getCategoryBasedChilds, { streamId, objectId });
