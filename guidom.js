/* guidom writed by Thiago Marques */
var moloader = require("moloader");
moloader.load("fs, async, camelcase", { name: "pathmodule", path: "path" });
var handlebars = require("handlebars");

/*
 Reference
 +-- http://handlebarsjs.com/reference.html

 Methods
 +-- create: ...
 +-- openDir: ...
 +-- precreate: ...
 +-- preopenDir: ...
 +-- setRoot: ...
 +-- setHandlebars: ...
 +-- getRoot: ...
 +-- getHandlebars: ...

 Value holders
 +-- templates: ...
 +-- pretemplates: ...
*/

var guidom = {
    templates: {},
    pretemplates: {},
    _holders: {
        root: ""
    },
    /**
     * @param  {string} root
     */
    setRoot: function (root) { // sets the root dir;
        if (typeof root == "string") this._holders.root = root;
    },
    getRoot: function () {
        return this._holders.root;
    },
    /**
     * @param  {Object} obj
     */
    setHandlebars: function (obj) {
        handlebars = obj;
    },
    getHandlebars: function () {
        return handlebars;
    },
    /**
     * @param  {(Object[]|Object|string)} arg
     * @param  {string} arg[].name
     * @param  {string} arg[].path
     * @param  {Object} [options]
     */
    _loadTemplatesSync: function (arg, options) {
        if (Array.isArray(arg)) {
            var templates = {};
            for (var i = 0, len = arg.length; i < len; i++) {
                templates[arg[i].name] = this._buildTemplate(fs.readFileSync(pathmodule.join(this._holders.root, arg[i].path), "utf-8"), options);
            }
            // concat templates with this.templates;
            Object.assign(this.templates, templates);
            return templates;
        } else if (typeof arg == "object") {
            this.templates[arg.name] = this._buildTemplate(fs.readFileSync(pathmodule.join(this._holders.root, arg.path), "utf-8"), options);
            return this.templates[arg.name];
        } else if (typeof arg == "string") {
            return this._buildTemplate(fs.readFileSync(pathmodule.join(this._holders.root, arg), "utf-8"), options);
        }
    },
    /**
     * @param  {(Object[]|Object|string)} arg
     * @param  {string} arg[].name
     * @param  {string} arg[].path
     * @param  {Object} [options]
     * @param  {Function} initialCallback
     */
    _loadTemplates: function (arg, options, initialCallback) {
        var that = this;
        var verifyOptions = function (err, results) {
            if (typeof options == "function") initialCallback = options;
            if (err) return initialCallback(err);
            initialCallback(null, results); // results: {name1: "template1", ...};
        }
        // ([{name: "str", path: "str"}, ...], [options], callback);
        if (Array.isArray(arg)) {
            var stack = {};
            for (var i = 0; i < arg.length; i++) {
                var index = i; // something I can't understand about this i inside this function;
                stack[arg[index].name] = function (callback) {
                    fs.readFile(pathmodule.join(that._holders.root, arg[index].path), "utf-8", function (err, file) {
                        if (err) return callback(err);
                        if (typeof options == "function") file = that._buildTemplate(file);
                        else file = that._buildTemplate(file, options);
                        callback(null, file);
                    });
                };
            }
            async.series(stack, function (err, results) {
                // concat results with that.templates;
                if (!err) Object.assign(that.templates, results);
                verifyOptions(err, results);
            });
        }
        // ({name: "str", path: "str"}, [options], callback);
        else if (typeof arg == "object") {
            fs.readFile(pathmodule.join(this._holders.root, arg.path), "utf-8", function (err, file) {
                if (!err) {
                    if (typeof options == "function") file = that._buildTemplate(file);
                    else file = that._buildTemplate(file, options);
                    that.templates[arg.name] = file;
                }
                verifyOptions(err, file);
            });
        }
        // ("name", [options], callback);
        else if (typeof arg == "string") {
            fs.readFile(pathmodule.join(this._holders.root, arg), "utf-8", function (err, file) {
                if (!err) {
                    if (typeof options == "function") file = that._buildTemplate(file);
                    else file = that._buildTemplate(file, options);
                    that.templates[arg.name] = file;
                }
                verifyOptions(err, file);
            });
        }
    },
    /**
     * @param  {string} source
     * @param  {Object} [options]
     */
    _buildTemplate: function (source, options) {
        if (typeof options != "function") {
            return handlebars.compile(source, options);
        } else {
            return handlebars.compile(source);
        }
    },
    /**
     * @param  {(Object[]|Object|string)} firstArg
     * @param  {(Function|Object|string)} [secondArg]
     * @param  {(Function|Object)} [options]
     * @param  {Function} [callback]
     */
    create: function (firstArg, secondArg, options, callback) {
        var that = this;
        if (typeof callback == "function" || typeof secondArg == "function" || typeof options == "function") {
            // this._loadTemplates();
            // ([{name: "str", path: "str"}, ...], [options], callback);
            if (Array.isArray(firstArg) && typeof firstArg[0] == "object" && firstArg[0].name && firstArg[0].path) { // input: [{ name: "string", path: "string"}, ...]
                // (array, callback);
                if (typeof secondArg == "function") {
                    callback = secondArg;
                    this._loadTemplates(firstArg, callback);
                }
                // (array, options, callback);
                else if (typeof secondArg == "object") {
                    callback = options;
                    options = secondArg;
                    this._loadTemplates(firstArg, options, callback);
                }
            }
            // ("name", "path", [options], callback);
            else if (typeof firstArg == "string" && typeof secondArg == "string") {
                // ("name", "path", options, callback);
                if (typeof options == "function") {
                    callback = options;
                    this._loadTemplates({ name: firstArg, path: secondArg }, options, callback);
                }
                // ("name", "path", callback);
                else {
                    this._loadTemplates({ name: firstArg, path: secondArg }, callback);
                }
            }
            // ("path", [options], callback) |or| ({name: "str", path: "str"}, [options], callback);
            else if (typeof firstArg == "object" || typeof firstArg == "string") {
                // ("path", callback) |or| ({name: "str", path: "str"}, callback);
                if (typeof secondArg == "function") {
                    callback = secondArg;
                    this._loadTemplates(firstArg, callback);
                }
                // ("path", options, callback) |or| ({name: "str", path: "str"}, options, callback);;
                else {
                    this._loadTemplates(firstArg, options, callback);
                }
            }
        } else {
            // this._loadTemplatesSync();
            // ([{ name: "str", path: "str"}, ...], [options]);
            if (Array.isArray(firstArg) && firstArg[0].path) {
                var result = {};
                if (typeof secondArg == "object") options = secondArg;
                for (var i = 0; i < firstArg.length; i++) {
                    var index = i;
                    result[firstArg[index].name] = that._loadTemplatesSync({ name: firstArg[index].name, path: firstArg[index].path }, options);
                }
                return result; // returns: {name1: template(data), ...};
            }
            // ("name", "path", [options]);
            else if (typeof firstArg == "string" && typeof secondArg == "string") {
                return that._loadTemplatesSync({ name: firstArg, path: secondArg }, options);
            }
            // ("path", [options]) |or| ({name: "str", path: "str"}, [options]);
            else if ((typeof firstArg == "object" || typeof firstArg == "string")) {
                if (typeof secondArg == "object") options = secondArg;
                return this._loadTemplatesSync(firstArg, options);
            }
        }
    },

    /**
     * @param  {(Object[]|Object|string)} arg
     * @param  {string} arg[].name
     * @param  {string} arg[].path
     * @param  {Object} [options]
     */
    _loadPretemplatesSync: function (arg, options) {
        if (Array.isArray(arg)) {
            var pretemplates = {};
            for (var i = 0, len = arg.length; i < len; i++) {
                pretemplates[arg[i].name] = this._buildPretemplate(fs.readFileSync(pathmodule.join(this._holders.root, arg[i].path), "utf-8"), options);
            }
            // concat templates with this.templates;
            Object.assign(this.pretemplates, pretemplates);
            return pretemplates;
        } else if (typeof arg == "object") {
            this.pretemplates[arg.name] = this._buildPretemplate(fs.readFileSync(pathmodule.join(this._holders.root, arg.path), "utf-8"), options);
            return this.pretemplates[arg.name];
        } else if (typeof arg == "string") {
            return this._buildPretemplate(fs.readFileSync(pathmodule.join(this._holders.root, arg), "utf-8"), options);
        }
    },
    /**
     * @param  {(Object[]|Object|string)} arg
     * @param  {string} arg[].name
     * @param  {string} arg[].path
     * @param  {Object} [options]
     * @param  {Function} initialCallback
     */
    _loadPretemplates: function (arg, options, initialCallback) {
        var that = this;
        var verifyOptions = function (err, results) {
            if (typeof options == "function") initialCallback = options;
            if (err) return initialCallback(err);
            initialCallback(null, results); // results: {name1: "template1", ...};
        }
        // ([{name: "str", path: "str"}, ...], [options], callback);
        if (Array.isArray(arg)) {
            var stack = {};
            for (var i = 0; i < arg.length; i++) {
                var index = i; // something I can't understand about this i inside this function;
                stack[arg[i].name] = function (callback) {
                    fs.readFile(pathmodule.join(that._holders.root, arg[index].path), "utf-8", function (err, file) {
                        if (err) return callback(err);
                        if (typeof options == "function") file = that._buildPretemplate(file);
                        else file = that._buildPretemplate(file, options);
                        callback(null, file);
                    });
                };
            }
            async.series(stack, function (err, results) {
                // concat results with that.pretemplates;
                if (!err) Object.assign(that.pretemplates, results);
                verifyOptions(err, results);
            });
        }
        // ({name: "str", path: "str"}, [options], callback);
        else if (typeof arg == "object") {
            fs.readFile(pathmodule.join(this._holders.root, arg.path), "utf-8", function (err, file) {
                if (!err) {
                    if (typeof options == "function") file = that._buildPretemplate(file);
                    else file = that._buildPretemplate(file, options);
                    that.pretemplates[arg.name] = file;
                }
                verifyOptions(err, file);
            });
        }
        // ("name", [options], callback);
        else if (typeof arg == "string") {
            fs.readFile(pathmodule.join(this._holders.root, arg), "utf-8", function (err, file) {
                if (!err) {
                    if (typeof options == "function") file = that._buildPretemplate(file);
                    else file = that._buildPretemplate(file, options);
                    that.pretemplates[arg.name] = file;
                }
                verifyOptions(err, file);
            });
        }
    },
    /**
     * @param  {string} source
     * @param  {Object} [options]
     */
    _buildPretemplate: function (source, options) {
        if (typeof options != "function") {
            return handlebars.precompile(source, options);
        } else {
            return handlebars.precompile(source);
        }
    },

    /**
     * @param  {(Object[]|Object|string)} firstArg
     * @param  {(Function|Object|string)} [secondArg]
     * @param  {(Function|Object)} [options]
     * @param  {Function} [callback]
     */
    precreate: function (firstArg, secondArg, options, callback) {
        var that = this;
        if (typeof callback == "function" || typeof secondArg == "function" || typeof options == "function") {
            // this._loadPretemplates();
            // ([{name: "str", path: "str"}, ...], [options], callback);
            if (Array.isArray(firstArg) && typeof firstArg[0] == "object" && firstArg[0].name && firstArg[0].path) { // input: [{ name: "string", path: "string"}, ...]
                // (array, callback);
                if (typeof secondArg == "function") {
                    callback = secondArg;
                    this._loadPretemplates(firstArg, callback);
                }
                // (array, options, callback);
                else if (typeof secondArg == "object") {
                    callback = options;
                    options = secondArg;
                    this._loadPretemplates(firstArg, options, callback);
                }
            }
            // ("name", "path", [options], callback);
            else if (typeof firstArg == "string" && typeof secondArg == "string") {
                // ("name", "path", options, callback);
                if (typeof options == "function") {
                    callback = options;
                    this._loadPretemplates({ name: firstArg, path: secondArg }, options, callback);
                }
                // ("name", "path", callback);
                else {
                    this._loadPretemplates({ name: firstArg, path: secondArg }, callback);
                }
            }
            // ("path", [options], callback) |or| ({name: "str", path: "str"}, [options], callback);
            else if (typeof firstArg == "object" || typeof firstArg == "string") {
                // ("path", callback) |or| ({name: "str", path: "str"}, callback);
                if (typeof secondArg == "function") {
                    callback = secondArg;
                    this._loadPretemplates(firstArg, callback);
                }
                // ("path", options, callback) |or| ({name: "str", path: "str"}, options, callback);;
                else {
                    this._loadPretemplates(firstArg, options, callback);
                }
            }
        } else {
            // this._loadPretemplatesSync();
            // ([{ name: "str", path: "str"}, ...], [options]);
            if (Array.isArray(firstArg) && firstArg[0].name && firstArg[0].path) {
                var result = {};
                if (typeof secondArg == "object") options = secondArg;
                for (var i = 0; i < firstArg.length; i++) {
                    var index = i;
                    result[firstArg[index].name] = that._loadPretemplatesSync({ name: firstArg[index].name, path: firstArg[index].path }, options);
                }
                return result; // returns: {name1: template(data), ...};
            }
            // ("name", "path", [options]);
            else if (typeof firstArg == "string" && typeof secondArg == "string") {
                return that._loadPretemplatesSync({ name: firstArg, path: secondArg }, options);
            }
            // ("path", [options]) |or| ({name: "str", path: "str"}, [options]);
            else if ((typeof firstArg == "object" || typeof firstArg == "string")) {
                if (typeof secondArg == "object") options = secondArg;
                return this._loadPretemplatesSync(firstArg, options);
            }
        }
    },
    /**
     * @param  {string} dirName
     * @param  {Object} [options]
     * @param  {Function} [callback]
     */
    openDir: function (dirName, options, callback) {
        if (typeof options == "function") {
            callback = options;
            options = {};
        }
        if (callback) {
            var dirPathname = pathmodule.join(this._holders.root, dirName);
            var dirfiles = [];
            var templates = {};
            async.series([
                function (seriesCallback) {
                    fs.readdir(dirPathname, "utf-8", function (err, files) {
                        dirfiles = files;
                        seriesCallback(err, files);
                    });
                },
                function (seriesCallback) {
                    var stack = [];
                    dirfiles = dirfiles.map(function (elem) {
                        return { name: pathmodule.basename(elem), path: pathmodule.join(dirPathname, elem) };
                    });
                    for (var i = 0; i < dirfiles.length; i++) {
                        stack[i] = function (index, subSeriesCallback) {
                            if (typeof index == "function") {
                                subSeriesCallback = index;
                                index = 0;
                            }
                            fs.stat(dirfiles[index].path, function (err, stats) {
                                if (!err && stats.isDirectory()) {
                                    dirfiles[index] = null;
                                }
                                index++;
                                subSeriesCallback(err, index);
                            });
                        }
                    }
                    async.waterfall(stack, function (err, result) {
                        seriesCallback(err, result);
                    });
                }
            ],
                function (err, result) {
                    dirfiles = dirfiles.clean(null);
                    guidom.create(dirfiles, options, function (err, templates) {
                        callback(err, templates);
                    });
                }
            );
        } else {
            var dirPathname = pathmodule.join(this._holders.root, dirName);
            var dirfiles = fs.readdirSync(dirPathname, "utf-8");
            var templates = {};
            for (var i = 0; i < dirfiles.length; i++) {
                var pathname = pathmodule.join(dirPathname, dirfiles[i]);
                if (fs.statSync(pathname).isFile()) {
                    var basename = camelcase(pathmodule.basename(dirfiles[i]));
                    templates[basename] = guidom.create(basename, pathname, options);
                }
            }
            return templates;
        }
    },

    /**
     * @param  {string} dirName
     * @param  {Object} [options]
     * @param  {Function} [callback]
     */
    preopenDir: function (dirName, options, callback) {
        if (typeof options == "function") {
            callback = options;
            options = {};
        }
        if (callback) {
            var dirPathname = pathmodule.join(this._holders.root, dirName);
            var dirfiles = [];
            var templates = {};
            async.series([
                function (seriesCallback) {
                    fs.readdir(dirPathname, "utf-8", function (err, files) {
                        dirfiles = files;
                        seriesCallback(err, files);
                    });
                },
                function (seriesCallback) {
                    var stack = [];
                    dirfiles = dirfiles.map(function (elem) {
                        return { name: pathmodule.basename(elem), path: pathmodule.join(dirPathname, elem) };
                    });
                    for (var i = 0; i < dirfiles.length; i++) {
                        stack[i] = function (index, subSeriesCallback) {
                            if (typeof index == "function") {
                                subSeriesCallback = index;
                                index = 0;
                            }
                            fs.stat(dirfiles[index].path, function (err, stats) {
                                if (!err && stats.isDirectory()) {
                                    dirfiles[index] = null;
                                }
                                index++;
                                subSeriesCallback(err, index);
                            });
                        }
                    }
                    async.waterfall(stack, function (err, result) {
                        seriesCallback(err, result);
                    });
                }
            ],
                function (err, result) {
                    dirfiles = dirfiles.clean(null);
                    guidom.precreate(dirfiles, options, function (err, templates) {
                        callback(err, templates);
                    });
                }
            );
        } else {
            var dirPathname = pathmodule.join(this._holders.root, dirName);
            var dirfiles = fs.readdirSync(dirPathname, "utf-8");
            var templates = {};
            for (var i = 0; i < dirfiles.length; i++) {
                var pathname = pathmodule.join(dirPathname, dirfiles[i]);
                if (fs.statSync(pathname).isFile()) {
                    var basename = camelcase(pathmodule.basename(dirfiles[i]));
                    templates[basename] = guidom.precreate(basename, pathname, options);
                }
            }
            return templates;
        }
    }
}


/* Polyfill */
// From: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

module.exports = guidom;