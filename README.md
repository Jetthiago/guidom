# guidom
[![Build Status](https://travis-ci.org/Jetthiago/guidom.svg?branch=master)](https://travis-ci.org/Jetthiago/guidom)
A Handlebars plugin to help loading template files into the node js runtime, compile it and make available for use faster and without too much effort.
I'am working at this documentation. I'll update it when it's ready. For now this will be the placeholder:

* * *
### setRoot(root) 
**Parameters**
**root**: `string`

### setHandlebars(obj) 
**Parameters**
**obj**: `Object`

## saveTemplates(bool)
**Parameters**
**bool**: `Boolean`

## returnSyncTemplates(bool)
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

### create(firstArg, [secondArg], [options], [callback]) 
**Parameters**
**firstArg**: `Object[] | Object | string`
**secondArg**: `function | Object | string`
**options**: `function | Object`
**callback**: `function(err, templates)`

**Example**
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
|--temp-example.hb
```

```js
guidom.openDir("./templates");

response.write(guidom.templates.tempExample({data: data}));
response.write(guidom.templates.tempExample2({data: data2}));
```

### precreate(firstArg, [secondArg], [options], [callback]) 
Works the same way as .create() but returns the precompiled string and the functions will be available at .pretemplates;
**Parameters**
**firstArg**: `Object[] | Object | string`
**secondArg**: `function | Object | string`
**options**: `function | Object`
**callback**: `function(err, pretemplates)`

### preopenDir(dirName, [options], [callback]) 
Works the same way as .openDir() but returns the precompiled string and the functions will be available at .pretemplates;
**Parameters**
**dirName**: `string`
**options**: `Object`
**callback**: `function(err, pretemplates)`

* * *
**Side note: I will publish this module to npm when I address the majority of the possible bugs and add the features that I have in mind**