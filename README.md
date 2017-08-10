# guidom
[![Build Status](https://travis-ci.org/Jetthiago/guidom.svg?branch=master)](https://travis-ci.org/Jetthiago/guidom)
A Handlebars plugin to help loading template files into the node js runtime, compile it and make available for use faster and without too much effort.
I'am working at this documentation. I'll update it when it's ready. For now this will be the placeholder:
**Side note: I will publish this module to npm when I address the majority of the possible bugs and add the features that I have in mind**

* * *
### create(firstArg, [secondArg], [options], [callback]) 
**Parameters**  
**firstArg**: `Object[] | Object | string`  
**secondArg**: `function | Object | string`  
**options**: `function | Object`  
**callback**: `function(err, templates)`  
- **List of possible arguments:**
```js
([{name: "string", path: "string"}, ...], [options], [callback]);
/* callback arguments: (error, {name: templateFunction, ...}),
without callback returns: {name: templateFunction, ...} */
```
```js
("name", "path", [options], [callback]);
/* callback arguments: (error, templateFunction),
without callback returns: templateFunction */
```
```js
("path", [options], [callback]);
/* callback arguments: (error, templateFunction),
without callback returns: templateFunction
get the template function using the object returned .{fileBasename} or guidom.templates.{fileBasename} */
```
```js
({name: "string", path: "string"}, [optinons], [callback]);
/* callback arguments: (error, templateFunction),
without callback reuturns: templateFunction */
```
```js
(["templates/main-page.hb", ...], [options], [callback]);
/* get the template function using the object returned .mainPage or guidom.templates.mainPage */
```

- **Example**
```js
var indexPage = guidom.create("templates/index.hb");
/* or */
var indexPage;
guidom.create("templates/index.hb", function(err, template){
    indexPage = template;
});
/* or */
guidom.create("indexPage", "templates/index.hb");
/* template function will be available on guidom.templates.indexPage */

/* and then call the template function: */
response.write(indexPage({firstName: "Jason", secondName: "Brian"}));
/* or call with the autosaved template function:  */
respose.write(guidom.templates.indexPage({firstName: "Jason", secondName: "Brian"}));
```

### openDir(dirName, [options], [callback]) 
**Parameters**
**dirName**: `string`
**options**: `Object`
**callback**: `function(err, templates)`

**Example**
- Given the following directory structure:
```
templates
|--temp-example.hb
|--temp-example2.hb
```

```js
guidom.openDir("./templates");

response.write(guidom.templates.tempExample({data: data}));
response.write(guidom.templates.tempExample2({data: data2}));
```

### precreate(firstArg, [secondArg], [options], [callback]) 
Works the same way as .create() but returns the precompiled string and the functions will be available at .pretemplates.
**Parameters**
**firstArg**: `Object[] | Object | string`
**secondArg**: `function | Object | string`
**options**: `function | Object`
**callback**: `function(err, pretemplates)`

### preopenDir(dirName, [options], [callback]) 
Works the same way as .openDir() but returns the precompiled string and the functions will be available at .pretemplates.
**Parameters**
**dirName**: `string`
**options**: `Object`
**callback**: `function(err, pretemplates)`

### setRoot(root) 
Will set a root directory. Example: 
```js
/* templates/index.hb */
guidom.setRoot("templates");
guidom.create("index.hb");
```

**Parameters**
**root**: `string`

### setHandlebars(obj) 
**Parameters**
**obj**: `Object`

### saveTemplates(bool)
If set to false, every template function will no longer be autosaved.
**Parameters**
**bool**: `Boolean`

### returnSyncTemplates(bool)
If set to false, when calling .create whitout callback, will make it return the guidom object instead of the template.
**Parameters**
**bool**: `Boolean`

### getRoot()
**return**: `string`

### getHandlebars()
**return**: `Object`

### getSaveTemplates()
**return**: `Boolean`

### getReturnSyncTemplates()
**return**: `Boolean`

* * *
