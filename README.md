# Speckle LCA

SpeckleLCA is a web app that connects to [Speckle](https://speckle.systems/) and allows for a simple forkflow to calculate LCA results for early phase design projects.
The app is still in development and support [One Click LCA](https://www.oneclicklca.com/) as well as [LCAbyg](https://lcabyg.dk/en/) for now.

There is a devoted slack for this project where you can chat with all collaborators, iospecklelcaapp.slack.com.
Discussion regarding direct functionality, bug reports etc should be done in the discussions here on github.

## How to run it

To run the app you will need:

 - [Node.js](https://nodejs.org/en/) _has been tested with vesion 16.14.0_
 - [VSCode](https://code.visualstudio.com/) or a similar text editor ([Neovim](https://neovim.io/) :wink:)
 - Set the following enviroment variables\
The easiest way is to put them in a `.env.local` file in the root folder off the project.


```
VUE_APP_SPECKLE_ID=CHANGE
VUE_APP_SPECKLE_SECRET=CHANGE
VUE_APP_SERVER_URL=https://speckle.xyz
VUE_APP_SPECKLE_NAME="Speckle LCA"

VUE_APP_LCABYG_USER=CHANGE
VUE_APP_LCABYG_PASSWORD=CHANGE

VUE_APP_ONE_CLICK_LCA_PASSWORD=CHANGE
VUE_APP_ONE_CLICK_LCA_USERNAME=CHANGE

VUE_APP_FIRE_BASE_URL=CHANGE
VUE_APP_FIRE_BASE_API_KEY=CHANGE
```

- Then run `npm ci` in VSCode or a different terminal\
  To download and install the required modules.
- `npm run serve` Finally launches the app.

The `VUE_APP_SPECKLE_ID` & `VUE_APP_SPECKLE_SECRET` values can be genereated by to Prifile -> Developer Settings -> Aæælications on Speckle and creating a new entry.

`VUE_APP_LCABYG_USER` & `VUE_APP_LCABYG_PASSWORD` are the credentials to the LCAbyg API.

## Usage

Login to speckle and add app under your account a new application you will get a application ID and a secret ID add thiese to `.env.local`.

Run web app locally through `npm run serve`

Should be able to login now at localhost:8080

## Troubleshooting

If the build or run fails with `ERR_OSSL_EVP_UNSUPPORTED`\
The enviroment variable NODE_OPTIONS needs to be set to `--openssl-legacy-provider` like so:

```
export  NODE_OPTIONS=--openssl-legacy-provider
```

## App structure

The app is built with vue and uses a common framework for connecting with APIs and vueX with shared store with 3 primary modules for speckle, material mapper and results. This structure is not set in stone and if someone is more profficient in structuring these kinds of webbapps please contribute and help design it so it makes more sense for everyone.

![VueAppStructure](https://user-images.githubusercontent.com/81305859/228532437-2e16ef8e-0baa-42de-91c6-2161d815035f.jpg)

Each page is defined within its views and some uses components that populate each of the different parts of the page, below is a diagram showing the structure of the material mapper page which uses this structure. So if you want to change or add any functionallity its within these specified component below that you should make the changes in.

![MaterialMapper structure](https://user-images.githubusercontent.com/81305859/228532742-2c5221d5-f413-4f2b-adb4-3b6fed1e0fca.jpg)
