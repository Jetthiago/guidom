# guidom
[![Build Status](https://travis-ci.org/Jetthiago/guidom.svg?branch=master)](https://travis-ci.org/Jetthiago/guidom)

A Handlebars plugin to help loading template files into the node js runtime, compile it and make available for use faster and without too much effort. For example: 
```js
/* templates/index.hb > "Welcome back {{name}}, id: {{id}}." */
var index = guidom.compile("templates/index.hb");
/* will return a handlebars template function so that you can pass the context (or data if you prefer): */
index({name: "Boris", id:"455"}); // > "Welcome back Boris, id: 455."
```
<<<<<<< HEAD
**Side note: I'm not very good at english as it's not my native language so expect grammar errors.**
=======
This eliminates the need for reading the template using the `fs` module to load every file.
**Side note: I'm not very good at english as it's not my native language so expect grammar errors.**
**Side note²: I'm planing to make a new update adding a much better suport for partials, helpers and other Handlebars methods. But only when my college vacations begin.**
>>>>>>> 552f0ad24d9f6470c0857e864bfc4ec30a832574

* * *
### compile(firstArg, [secondArg], [options], [callback])
* **Parameters**
**firstArg**: `Object[] | Object | string`
**secondArg**: `function | Object | string`
**options**: `function | Object`  Handlebars options object.
**callback**: `function(err, templates)`

Returns a regular handlebars template function. Omit the callback to run the function synchronously. Callback receives as arguments ```(err, function)```. When a array is given to ```firstArg``` the result returned will be like: ```{name: function, name2: function, ...}``` as ```name``` being the name given inside the describing object inside the ```firstArg``` array or the basename camellifyed (camelcase) of the file if the name wasn't provided.
The ```name``` is used as a custom id if you want to return a function already compiled without needing to assign it to a variable. Considering that the name given was ```index``` The function will be saved in ```guidom.templates.index```. But if a ```name``` isn't assingned, a name will be generated using the path. Given path "templates/main-page.hb": ```guidom.templates.mainPage```.

- **List of possible arguments and what each returns (valid for `guidom.precompile()` too):**
```js
guidom.compile(["templates/main-page.hb", ...], [options], [callback]);
/* returns: {mainPage: function};
get the template function using the object returned .mainPage or guidom.templates.mainPage */
```
```js
guidom.compile([{name: "string", path: "string"}, ...], [options], [callback]);
/* callback arguments: (error, {name: templateFunction, ...}),
returns: {name: templateFunction, ...} */
```
```js
guidom.compile("name", "path", [options], [callback]);
/* callback arguments: (error, templateFunction),
without callback returns: templateFunction */
```
```js
guidom.compile("path", [options], [callback]);
/* callback arguments: (error, templateFunction),
without callback returns: templateFunction */
```
```js
guidom.compile({name: "string", path: "string"}, [optinons], [callback]);
/* callback arguments: (error, templateFunction),
without callback reuturns: templateFunction */
```

- **Usage example**
```js
var indexPage = guidom.compile("templates/index.hb");
/* or */
var indexPage;
guidom.compile("templates/index.hb", function(err, template){
    indexPage = template;
});
/* or */
guidom.compile("indexPage", "templates/index.hb");
/* template function will be available on guidom.templates.indexPage */
...
/* and then call the template function: */
response.write(indexPage({firstName: "Jason", secondName: "Brian"}));
/* or call with the autosaved template function:  */
respose.write(guidom.templates.indexPage({firstName: "Jason", secondName: "Brian"}));
```

### compileDir(dirName, [options], [callback])
* **Parameters**
**dirName**: `string` Path to the directory.
**options**: `Object`  Handlebars options object.
**callback**: `function(err, templates)`

Pass a directory path and the files inside it will be compiled and reuturned.

**Example**
- Given the following directory structure:
```
─templates
 ├─temp-example.hb
 └─temp-example2.hb
```

```js
guidom.compileDir("./templates");
...
response.write(guidom.templates.tempExample({data: data}));
response.write(guidom.templates.tempExample2({data: data2}));
```

### precompile(firstArg, [secondArg], [options], [callback]) 
* **Parameters**
**firstArg**: `Object[] | Object | string`
**secondArg**: `function | Object | string`
**options**: `function | Object`
**callback**: `function(err, pretemplates)`

Works the same way as `guidom.compile()` but returns the precompiled string and the strings of the functions will be available at `guidom.pretemplates`.

### precompileDir(dirName, [options], [callback])
* **Parameters**
**dirName**: `string` Path to the directory.
**options**: `Object`  Handlebars options object.
**callback**: `function(err, templates)`

Works the same way as `guidom.compileDir()` but returns the precompiled strings and they will be available at `guidom.pretemplates`.

### setRoot(root) 
* **Parameters**
**root**: `string`

Will set a root directory. Example: 
```js
/* templates/index.hb */
guidom.setRoot("templates");
guidom.compile("index.hb");
```
Modifies all the "creation" methods.

### setHandlebars(obj) 
* **Parameters**
**obj**: `Object`

Should be used when declaring a Handlebars `helper`, a `partial`, a `decorator` or any other Handlebars method. Example:
```js
var handlebars = guidom.getHandlebars();
handlebars.registerHelper('foo', function() {
});
handlebars.registerPartial({
    bar: partial,
    baz: partial
});
Handlebars.registerDecorator('qux', function() {
});
guidom.setHandlebars(handlebars);
// Planig to implement a easier method.
```

### saveTemplates(bool)
* **Parameters**
**bool**: `Boolean`

If set to `false`, every following compiled template function will no longer be autosaved.

### returnSyncTemplates(bool)
* **Parameters**
**bool**: `Boolean`

If set to `false`, when calling .compile whitout callback, will make it return the guidom object instead of the template function.

### getRoot()
* **return**: `string`

Returns the assigned root directory.

### getHandlebars()
* **return**: `Object`

Returns the Handlebars module used to compile the templates.

### getSaveTemplates()
* **return**: `Boolean`

Returns `true` if the templates are being set to be autosaved and `false` otherwise. The default is `true`.

### getReturnSyncTemplates()
* **return**: `Boolean`

Returns `true` if the templates are being returned instead of the guidom object and `false` otherwise. The default is `true`.

* * *
