# grunt-appstorm

> AppStorm.JS compacter plugin

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-appstorm --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-appstorm');
```

## The "appstorm" task

### Overview
In your project's Gruntfile, add a section named `appstorm` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  appstorm: {
    options: {
      // Task-specific options go here.
    },
    dist: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

Where ```dist``` is a target, you can have as many target as you want.


### What it does

AppStorm.JS provide to use a grunt plugin to switch your development to a production ready system. Basically this grunt task launch a browser, ask for getting all ```a.state``` you have created, get all ```include``` in it. And finally create a file (usually ```appstorm.concat.html```), with every include inside.

This is a simple help to avoid too much loading from server, and keep it to the minimum, a single file.


### Options

#### options.engine
Type: `String`  
Default value: `'phantomjs'`  

The browser to use, can be ```phantomjs``` or ```chrome```.

#### options.path
Type: `String`  
Default value: `null`  

Only when using ```chrome``` engine, the path where to find Chrome/Chromium browser.

#### options.port
Type: `Integer`  
Default value: `null`  

Only when using ```chrome``` engine, the port to access Chrome/Chromium browser.

#### options.base
Type: `String`  
Default value: `'http://localhost/'`  

The root url of your project.


### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  appstorm: {
    options: {
      base: 'http://localhost/myProject/'
    },
    dist: {
      src: ['index.html'],
      dest: 'appstorm.concat.html'
    },
  },
});
```

In this configuration, the system will load ```http://localhost/myProject/index.html``` with ```phantomjs``` (phantomjs must be installed and register to PATH first). Then it will take all state's include found, and generate ```appstorm.concat.html``` at the same level as ```index.html```.

As you see, we don't specify any js files and/or html files. But directly the main project entry. This is because the system will load ```phantomjs``` to grab all state includes automatically for us, and resolve all path for us.

The result should looks something like this:

```html
<!-- FILE ./resources/html/welcome.html -->
<script type="appstorm/html" data-src="resources/html/welcome.html">
<div>
    welcome.html file
</div>
</script>

<!-- FILE ./resources/html/hello.html -->
<script type="appstorm/html" data-src="resources/html/hello.html">
<div>
    hello here hello.html
</div>
</script>
```

Where the type is one of the following: ```appstorm/css```, ```appstorm/js```, ```appstorm/translate```, ```appstorm/html```. The ```data-src``` is a sanitized url path, used internally when a state wants to load a specific url, it will sanitize url and check if it's not already existing in the ```a.compact``` object.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License

```grunt-appstorm``` is licensed under MIT license.
