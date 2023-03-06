# Speckle LCA

SpeckleLCA is a web app that connects to [Speckle](https://speckle.systems/) and allows for a simple forkflow to calculate LCA results for early phase design projects.
The app is still in development and support [One Click LCA](https://www.oneclicklca.com/) as well as [LCAbyg](https://lcabyg.dk/en/) for now.




## How to run it
To run the app you will need:
 - [Node.js](https://nodejs.org/en/)
 - [VSCode](https://code.visualstudio.com/) or something similar text editor ([Neovim](https://neovim.io/) :wink:)
 - Set the following enviroment variables\
The easiest way is to put them in a `.env.local` file in the root folder off the project.

```
VUE_APP_SPECKLE_ID=CHANGE
VUE_APP_SPECKLE_SECRET=CHANGE
VUE_APP_SERVER_URL=https://speckle.xyz
VUE_APP_SPECKLE_NAME="Speckle LCA"
```
 - Then run `npm ci` in VSCode or a different terminal\
 To download and install the required modules.
 - `npm run serve` Finally launches the app.
 
The `VUE_APP_SPECKLE_ID` & `VUE_APP_SPECKLE_SECRET` values can be genereated by to Prifile -> Developer Settings -> Aæælications on Speckle and creating a new entry.

 ## Usage


Login to speckle and add app under your account a new application you will get a application ID and a secret ID add thiese to `.env.local`.

Run web app locally through `npm run serve`

Should be able to login now at localhost:8080
