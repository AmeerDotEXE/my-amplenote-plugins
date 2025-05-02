# Amplenote Plugin Dev Enviorment

This is a dev env for my Amplenote plugins. It is meant to host all of my amplenote plugins in a single workspace. However, if you wish to fork this repo and use it for your own plugins, please use the original template i used for this development environment listed down below.

Current plugin list:
- [x] Long-term View Plugin

# Building, Testing, and Running Plugins

## Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Set the target folder in `package.json` to specify the plugin you want to work with. For example:

   ![Package.json configuration](https://github.com/debanjandhar12/my-amplenote-plugins-v2/assets/49021233/2f123d9b-d195-4dfd-9a00-f62bccf715b5)

   The target folder must contain a `plugin.js` file as the entry point.

## Building
- For production:
  ```
  npm run build:prod
  ```
- For development (with watch mode):
  ```
  npm run build:dev
  ```

## Testing
- Run Jest tests:
  ```
  npm run test
  ```
- Run tests in watch mode:
  ```
  npm run test:watch
  ```


## Development Environment Features

Im using an older version of debanjandhar12's template you can find the up-to-date template in his repo: 
https://github.com/debanjandhar12/my-amplenote-plugins-v2/

#### Additions
- fixed pathing to support windows platfrom

## Credits
- debanjandhar12 - plugin-template