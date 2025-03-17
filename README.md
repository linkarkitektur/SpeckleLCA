# Link IO SpeckLCA App

## App Showcase
### Select a project
![image](https://github.com/user-attachments/assets/24e27acb-74c8-4db0-88df-343ca320cd35)

### Overview its performance 
![image](https://github.com/user-attachments/assets/a8d508a9-1080-4917-93b0-cd69820e02fe)

### Dynamically filter it

https://github.com/user-attachments/assets/75fb0fa9-10af-4f63-954f-f2f895274cfc

### Map your materials

https://github.com/user-attachments/assets/29a3d245-447a-46fd-98ee-8f340335654a

### Immediate results

https://github.com/user-attachments/assets/0ab4f148-6b54-424b-acf3-8d64a3879a73

### Play with your 3d model

![image](https://github.com/user-attachments/assets/bef01ae3-c540-4a01-8256-d28d1d3ac681)


# Installation guide for Starting with contributions

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Firebase Integration Notes

### Firebase CLI

Recommended to install Firebase CLI globally:

```sh
npm install -g firebase-tools
```

### Firebase Project

Create a new Firebase project in the Firebase console. Add a web app to the project. Copy the Firebase config object from the Firebase console and paste it into `src/firebase/config.ts`.

### Enabling Firebase Features

Enable the minimum following Firebase features in the Firebase console:

- Authentication
- Cloud Firestore
- Cloud Storage
- Hosting

### Initialization

Run the following commands to initialize Firebase in the project:

```sh
firebase login
```

```sh
firebase init
```

Unless you have a specific reason to change the default settings, select the following options:

- Authentication
- Firestore
- Storage
- Hosting
- Functions (optional)
- Emulators (optional)

### Sensitive Files

Placeholder recommended .gitignore for repo. Remove as needed:

```json
# Firebase files
.src/firebase/config.ts
.firebase.json
.functions
.firebaserc
.firebase
*-debug.log
.runtimeconfig.json
```

## Sentry Integration Notes

During debug, and posibbly, if not presumeably, there are certain client-side errors that will not be caught by Sentry.

This is because Sentry is not initialized until the app is mounted. To catch these errors, you can use the following code snippet:

```js
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error)
})
```

Additionally, you can use the following code snippet to catch errors that occur during initialization:

```js
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason)
})
```

Finally, browser extensions may interfere with Sentry's ability to capture errors. If you are using an ad blocker, or Brave Shields, for example, you may need to disable it to ensure that Sentry can capture errors.
