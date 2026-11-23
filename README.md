# The Jungle Cook

The Jungle Cook is a recipe-themed website for creating, viewing, editing, and managing personal recipes. It is built with JavaScript, Sass, Firebase Authentication, and Vite.

## Website

**Live link:** [Add the deployed website URL here](WEB_LINK_PLACEHOLDER)

## Features

- Responsive home page
- Firebase login and account creation
- Create and edit recipes
- View full recipe details
- Browse recipes saved to a user account
- Hash-based navigation
- Responsive Sass styles organized by page
- Local recipe storage and Firebase-backed user authentication

## Pages

- Home
- Login
- Create Recipe
- Your Recipes
- Recipe View

## Run locally

You need [Node.js](https://nodejs.org/) and npm installed.

1. Open the project folder in a terminal.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown in your terminal.

## Build for production

Create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project structure

```text
index.html          Main HTML entry point
package.json        npm scripts and dependencies
vite.config.js      Vite configuration
public/             Public assets and recipe data
src/
  main.js           App entry point and authentication handling
  data/             Recipe store logic
  firebase/         Firebase configuration
  model/            Hash-based page loading logic
  pages/            Individual page modules
  sass/             Page and layout styles
  assets/           Images, icons, and fonts
```

## Tech stack

- JavaScript (ES modules)
- Sass
- Vite
- Firebase Authentication
