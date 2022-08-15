export const APP_NAME = process.env.VUE_APP_SPECKLE_NAME;
export const SERVER_URL = process.env.VUE_APP_ONE_CLICK_SERVER_URL;
export const USERNAME = process.env.VUE_APP_ONE_CLICK_USERNAME;
export const PASSWORD = process.env.VUE_APP_ONE_CLICK_PASSWORD;
export const ACCEESS_TOKEN = `${APP_NAME}.OCAccessToken`;
export const REFRESH_TOKEN = `${APP_NAME}.OCRefreshToken`;
export const CHALLENGE = `${APP_NAME}.Challenge`;

// Log in the current user.
export async function lcaLogin() {
  const res = await fetch(`${SERVER_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
  });
  const data = await res.json();
  console.log("3333 data", data);
  if (data.access_token) {
    // If retrieving the token was successful, remove challenge and set the new token and refresh token
    // localStorage.removeItem(CHALLENGE);
    localStorage.setItem(ACCEESS_TOKEN, data.access_token);
    localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
  }
  return data;
}

export async function getResourceList() {
  let access_token = localStorage.getItem(ACCEESS_TOKEN);
  let bearer = "Bearer " + access_token;
  const fetchPromise = fetch(
    `${SERVER_URL}/getResourceLibrary?dataCategory=fullResourceList`,
    {
      method: "GET",
      headers: {
        Authorization: bearer,
        "Content-Type": "application/json",
      },
    }
  );
  fetchPromise
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      return result?.resources;
    });
}
