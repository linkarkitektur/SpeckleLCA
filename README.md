# Speckle LCA


## How to run
To run app you need
[Node.js](https://nodejs.org/en/)
Visualstudio code or something similar

Then in visualstudio code run `npm ci`
Put `.env.local` file in the root folder of the application

```
VUE_APP_SPECKLE_ID=CHANGE
VUE_APP_SPECKLE_SECRET=CHANGE
VUE_APP_SERVER_URL=https://speckle.xyz
VUE_APP_SPECKLE_NAME="Speckle LCA"
```

Login to speckle and add app under your account a new application you will get a application ID and a secret ID add thiese to `.env.local`.

Run web app locally through `npm run serve`

Should be able to login now at localhost:8080
