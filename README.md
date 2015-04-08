# jsblocks-seed

Starting template for a jsblocks project

## Run the project

 * Clone the repository or directly download it from [here](https://github.com/astoilkov/jsblocks-seed/archive/master.zip)

```
git clone https://github.com/astoilkov/jsblocks-seed.git
```

 * Install dependencies. Navigate to the folder and run:

```
npm install
```

 * Run the application

```
npm start
```

## Application structure

### app directory

The app directory contains all files needed to run the application. The idea is to be able to use the app folder individually without the need of the files in the root directory:

```
js/             --> Place all your JavaScript files here. Recommended: use bower for external libraries
css/            --> Place all your CSS files here. Recommended: use bower for external libraries
views/          --> Place all your jsblocks application views(.html files)
index.html      --> Main application file. Include all your views from the views/ folder here
bower.json      --> Manages bower components. For more information about bower visit http://bower.io
```

### root directory

The root directory contains helper files if the project will be hosted on GitHub and app.js file which enables server-side rendering of the application:

```
app.js          --> The code used to run the application with server-side rendering
package.json    --> Manages npm packages. For more information about npm visit http://npmjs.com
.gitignore      --> File describing which files and folders to be skipped when pushing to GitHub
README.md       --> This file
LICENCE         --> The licence of this project
```

## Server-side rendering

The rendering is enabled by running app.js file which creates an express application.
The command below executes `node app.js` and then navigates to http://localhost:8000 in your browser.

```
npm run node
```