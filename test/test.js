var guidom = require("../guidom.js");
var assert = require("assert");
var pathmodule = require("path");

/* when testing on chorome;
var handlebars; $.ajax({url:"https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js", success: function(text){handlebars = text}}); eval(handlebars); // Handlebars
*/

var testFileInfo = {
    context1: { name: "Alan", hometown: "Somewhere, TX", kids: [{ name: "Jimmy", age: "12" }, { name: "Sally", age: "4" }] },
    context2: { name: "Brian", hometown: "Somewhere, TX", kids: [{ name: "Andrew", age: "7" }, { name: "Sara", age: "15" }] },
    template1: "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>",
    template2: "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have {{kids.length}} kids:</p> <ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>",
    dirName: "testTempDir",
    fileName1: "/testTempFile1.hb",
    fileName2: "/testTempFile2.hb",
    fileNamePrefix: "testTempFile",
    dirCrasher: "/crasher"
}
testFileInfo.fileName1 = testFileInfo.dirName + testFileInfo.fileName1;
testFileInfo.fileName2 = testFileInfo.dirName + testFileInfo.fileName2;
testFileInfo.dirCrasher = testFileInfo.dirName + testFileInfo.dirCrasher;

var expected = {
    output1: "<p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p> <ul><li>Jimmy is 12</li><li>Sally is 4</li></ul>",
    output2: "<p>Hello, my name is Brian. I am from Somewhere, TX. I have 2 kids:</p> <ul><li>Andrew is 7</li><li>Sara is 15</li></ul>",
    root: testFileInfo.dirName
}




describe("guidom", function () {
    describe("creating temporary directory", function () {
        it("should compile files inside the directory", function () {
            if (!fs.existsSync(testFileInfo.dirName)) {
                fs.mkdirSync(testFileInfo.dirName);
            }
            if (!fs.existsSync(testFileInfo.dirCrasher)) {
                fs.mkdirSync(testFileInfo.dirCrasher);
            }
            if (!fs.existsSync(testFileInfo.fileName1)) {
                fs.writeFileSync(testFileInfo.fileName1, testFileInfo.template1);
            }
            if (!fs.existsSync(testFileInfo.fileName2)) {
                fs.writeFileSync(testFileInfo.fileName2, testFileInfo.template2);
            }
            assert(fs.existsSync(testFileInfo.fileName1) && fs.existsSync(testFileInfo.fileName2));
        });
    });
    describe("#setRoot()", function () {
        it("should set the root directory", function () {
            var extractedPathname = pathmodule.basename(testFileInfo.fileName1);
            var expectedTemplate = guidom.compile(testFileInfo.fileName1);
            guidom.setRoot(expected.root);
            var rootedPathname = guidom.compile(extractedPathname);
            assert.equal(expected.root, guidom.getRoot());
            guidom.setRoot("");
            assert.equal(expectedTemplate(testFileInfo.context1), rootedPathname(testFileInfo.context1));
        });
    });
    describe("#setHandlebars", function () {
        it("shoud assing a new handlebars module", function () {
            var oldHb = guidom.getHandlebars(),
                hbModule = require("handlebars");
            hbModule["testing"] = true;
            guidom.setHandlebars(hbModule);
            assert(guidom.getHandlebars().testing);
            guidom.setHandlebars(oldHb);
        })
    });

    describe("#compile()", function () {
        /**
         * @param  {function} template
         * @param  {string} prefix
         * @param  {number} index
         */
        function testEndTemplate(template, prefix, index) {
            if (!index) {
                index = "1";
                var savedIndex = "";
            } else {
                var savedIndex = index;
            }
            var handlebars = guidom.getHandlebars();
            assert.equal(template(testFileInfo["context" + index]), expected["output" + index]);
            if (prefix) {
                var saved = guidom.templates[prefix + savedIndex];
                assert.equal(saved(testFileInfo["context" + index]), expected["output" + index]);
            }
        }

        /* _-_-_-_-_-_- ASYNC METHODS _-_-_-_-_-_- */

        describe("compile with args (array, [options], callback)", function () {
            var array = [{ name: "asyncArray1", path: testFileInfo.fileName1 }, { name: "asyncArray2", path: testFileInfo.fileName2 }];
            it("should return (err, {templates}) to callback when called with (array, callback)", function (done) {
                guidom.compile(array, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results.asyncArray1(testFileInfo.context1), expected.output1);
                    assert.equal(results.asyncArray2(testFileInfo.context2), expected.output2);
                    assert.equal(guidom.templates.asyncArray1(testFileInfo.context1), expected.output1);
                    assert.equal(guidom.templates.asyncArray2(testFileInfo.context2), expected.output2);
                    done();
                });
            });
            it("should return (err, {templates}) to callback when called with (array, options, callback)", function (done) {
                var options = { knowHelpersOnly: true };
                guidom.compile(array, options, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results.asyncArray1(testFileInfo.context1), expected.output1);
                    assert.equal(results.asyncArray2(testFileInfo.context2), expected.output2);
                    assert.equal(guidom.templates.asyncArray1(testFileInfo.context1), expected.output1);
                    assert.equal(guidom.templates.asyncArray2(testFileInfo.context2), expected.output2);
                    done();
                });
            });
            it("should return (err, {templates} to callback when called with (['path', ...], callback)", function (done) {
                var arraySingleString = [];
                var prefix = testFileInfo.fileNamePrefix;
                for (var i = 0; i < array.length; i++) {
                    arraySingleString[i] = array[i].path;
                }
                guidom.compile(arraySingleString, function (err, results) {
                    if (err) return done(err);
                    for (var i = 1; i <= array.length; i++) {
                        testEndTemplate(results[prefix + i], prefix, i);
                    }
                    done();
                });
            });
        });

        describe("compile with args: ('name', 'path', [options], callback)", function () {
            it("should return (err, template) to callback when called with ('name', 'path', callback)", function (done) {
                guidom.compile("asyncTwoStr", testFileInfo.fileName1, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results(testFileInfo.context1), expected.output1);
                    assert.equal(guidom.templates.asyncTwoStr(testFileInfo.context1), expected.output1);
                    done();
                });
            });
            it("should return (err, template) to callback when called with ('name', 'path', options, callback)", function (done) {
                var options = { knowHelpersOnly: true };
                guidom.compile("asyncTwoStrOptions", testFileInfo.fileName1, options, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results(testFileInfo.context1), expected.output1);
                    assert.equal(guidom.templates.asyncTwoStrOptions(testFileInfo.context1), expected.output1);
                    done();
                });
            });
        });

        describe("compile with args: ('path', [options], callback) |or| ({path: 'str', [name: 'str']}, [options], callback)", function () {
            it("should return (err, template) to callback when called with ('path')", function (done) {
                guidom.compile(testFileInfo.fileName1, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results(testFileInfo.context1), expected.output1);
                    done();
                });
            });
            it("should return (err, template) to callback when called with ('path', options)", function (done) {
                var options = { knowHelpersOnly: true };
                guidom.compile(testFileInfo.fileName1, options, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results(testFileInfo.context1), expected.output1);
                    done();
                });
            });

            it("should return (err, template) to callback when called with ({name:'str', path: str}, options, callback)", function (done) {
                guidom.compile({ path: testFileInfo.fileName1, name: "asyncObject" }, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results(testFileInfo.context1), expected.output1);
                    assert.equal(guidom.templates.asyncObject(testFileInfo.context1), expected.output1);
                    done();
                });
            });
            it("should return (err, template) to callback when called with ({name: 'str', path:'str'}, options, callback)", function (done) {
                var options = { knowHelpersOnly: true };
                guidom.compile({ path: testFileInfo.fileName1, name: "asyncObject" }, options, function (err, results) {
                    if (err) return done(err);
                    assert.equal(results(testFileInfo.context1), expected.output1);
                    assert.equal(guidom.templates.asyncObject(testFileInfo.context1), expected.output1);
                    done();
                });
            });
        });

        /* _-_-_-_-_-_- SYNC METHODS _-_-_-_-_-_- */
        describe("compile with: (array, [options])", function () {
            // ([{ name: "str", path: "str"}, ...], [options]);
            it("should return a template when called with ([{ name: 'str', path: 'str'}, ...])", function () {
                var array = [{ name: "syncArray1", path: testFileInfo.fileName1 }, { name: "syncArray2", path: testFileInfo.fileName2 }];
                var templates = guidom.compile(array);
                assert.equal(templates.syncArray1(testFileInfo.context1), expected.output1);
                assert.equal(templates.syncArray2(testFileInfo.context2), expected.output2);
                assert.equal(guidom.templates.syncArray1(testFileInfo.context1), expected.output1);
                assert.equal(guidom.templates.syncArray2(testFileInfo.context2), expected.output2);
            });
            it("should return a template when called with ([{ name: 'str' path: 'str'}, ...], options)", function () {
                var array = [{ name: "syncArrayOptions1", path: testFileInfo.fileName1 }, { name: "syncArrayOptions2", path: testFileInfo.fileName2 }];
                var options = { knowHelpersOnly: true };
                var templates = guidom.compile(array, options);
                assert.equal(templates.syncArrayOptions1(testFileInfo.context1), expected.output1);
                assert.equal(templates.syncArrayOptions2(testFileInfo.context2), expected.output2);
                assert.equal(guidom.templates.syncArrayOptions1(testFileInfo.context1), expected.output1);
                assert.equal(guidom.templates.syncArrayOptions2(testFileInfo.context2), expected.output2);
            });
            it("should return a template when called with (['path', ...])", function () {
                var array = [testFileInfo.fileName1, testFileInfo.fileName2];
                var prefix = testFileInfo.fileNamePrefix;
                var templates = guidom.compile(array);
                for (var i = 1; i < array.length; i++) {
                    testEndTemplate(templates[prefix + i], prefix, i);
                }
            });
        });

        describe("compile with: ('name', 'path', [options])", function () {
            it("should return a template when called with ('name', 'path')", function () {
                var template = guidom.compile("syncTwoStr", testFileInfo.fileName1);
                assert.equal(template(testFileInfo.context1), expected.output1);
                assert.equal(guidom.templates.syncTwoStr(testFileInfo.context1), expected.output1);
            });
            it("should return a template when called with ('name', 'path', options)", function () {
                var options = { knowHelpersOnly: true };
                var template = guidom.compile("syncTwoStrOptions", testFileInfo.fileName1, options);
                assert.equal(template(testFileInfo.context1), expected.output1);
                assert.equal(guidom.templates.syncTwoStrOptions(testFileInfo.context1), expected.output1);
            });
        });

        describe("compile with:  ('path', [options]) |or| ({path: 'str', [name: 'str']}, [options])", function () {
            it("should return a template when called with ('path')", function () {
                var template = guidom.compile(testFileInfo.fileName1);
                assert.equal(template(testFileInfo.context1), expected.output1);
            });
            it("should return a template when called with ('path', options)", function () {
                var options = { knowHelpersOnly: true };
                var template = guidom.compile(testFileInfo.fileName1, options);
                assert.equal(template(testFileInfo.context1), expected.output1);
            });

            it("should return a template when called with ({name: 'str', path: 'str'}), and save it", function () {
                var template = guidom.compile({ name: "syncObject", path: testFileInfo.fileName1 });
                assert.equal(template(testFileInfo.context1), expected.output1);
                assert.equal(guidom.templates.syncObject(testFileInfo.context1), expected.output1);
            });
            it("should return a template when called with ({name: 'str', path: 'str'}, options), and save it", function () {
                var options = { knowHelpersOnly: true };
                var template = guidom.compile({ name: "syncObjectOptions", path: testFileInfo.fileName1 }, options);
                assert.equal(template(testFileInfo.context1), expected.output1);
                assert.equal(guidom.templates.syncObjectOptions(testFileInfo.context1), expected.output1);
            });
        });
    });

    describe("#precompile()", function () {
        /**
         * @param  {string} template
         * @param  {string} prefix
         * @param  {number} index
         */
        function testEndPretemplate(template, prefix, index) {
            if (!index) {
                index = "1";
                var savedIndex = "";
            } else {
                var savedIndex = index;
            }

            var handlebars = guidom.getHandlebars();
            template = (new Function("return " + template)());
            template = handlebars.template(template);
            assert.equal(template(testFileInfo["context" + index]), expected["output" + index]);
            if (prefix) {
                var saved = guidom.pretemplates[prefix + savedIndex];
                saved = (new Function("return " + saved)());
                saved = handlebars.template(saved);
                assert.equal(saved(testFileInfo["context" + index]), expected["output" + index]);
            }
        }

        /* _-_-_-_-_-_- SYNC METHODS _-_-_-_-_-_- */
        describe("precompile with args: (array, [options])", function () {
            // ([{ name: "str", path: "str"}, ...], [options]);
            it("should return a template when called with ([{ name: 'str', path: 'str'}, ...])", function () {
                var prefix = "preSyncArray";
                var array = [{ name: prefix + "1", path: testFileInfo.fileName1 }, { name: prefix + "2", path: testFileInfo.fileName2 }];
                var pretemplates = guidom.precompile(array);
                for (var i = 1; i <= array.length; i++) { testEndPretemplate(pretemplates[prefix + i], prefix, i); }
            });
            it("should return a template when called with ([{ name: 'str' path: 'str'}, ...], options)", function () {
                var prefix = "preSyncArrayOptions";
                var array = [{ name: prefix + "1", path: testFileInfo.fileName1 }, { name: prefix + "2", path: testFileInfo.fileName2 }];
                var options = { knowHelpersOnly: true };
                var pretemplates = guidom.precompile(array, options);
                for (var i = 1; i <= array.length; i++) { testEndPretemplate(pretemplates[prefix + i], prefix, i); }
            });
            it("should return a template when called with (['path', ...])", function () {
                var prefix = testFileInfo.fileNamePrefix;
                var array = [testFileInfo.fileName1, testFileInfo.fileName2];
                var pretemplates = guidom.precompile(array);
                for (var i = 1; i <= array.length; i++) {
                    testEndPretemplate(pretemplates[prefix + i], prefix, i);
                }
            })
        });

        describe("precompile with args: ('name', 'path', [options])", function () {
            // ("name", "path", [options]);
            it("should return a template when called with ('name', 'path')", function () {
                var prefix = "preSyncTwoStr";
                var pretemplate = guidom.precompile(prefix, testFileInfo.fileName1);
                testEndPretemplate(pretemplate, prefix);
            });
            it("should return a template when called with ('name', 'path', options)", function () {
                var prefix = "preSyncTwoStrOptions";
                var options = { knowHelpersOnly: true };
                var pretemplate = guidom.precompile(prefix, testFileInfo.fileName1, options);
                testEndPretemplate(pretemplate, prefix);
            });
        });

        describe("precompile with: ('path', [options]) |or| ({path: 'str', [name: 'str']}, [options])", function () {
            // ('path', [options]);
            it("should return a template when called with ('path')", function () {
                var prefix = testFileInfo.fileName1;
                var pretemplate = guidom.precompile(prefix, testFileInfo.fileName1);
                testEndPretemplate(pretemplate, "");
            });
            it("should return a template when called with ('path', options)", function () {
                var prefix = "preSyncTwoStrOptions";
                var options = { knowHelpersOnly: true };
                var pretemplate = guidom.precompile(prefix, testFileInfo.fileName1, options);
                testEndPretemplate(pretemplate, "");
            });
            // ({name: 'str', path: 'str'}, [options]);
            it("should return a template when called with ({name: 'str', path: 'str'})", function () {
                var prefix = "preSyncPreObject";
                var pretemplate = guidom.precompile({ name: prefix, path: testFileInfo.fileName1 });
                testEndPretemplate(pretemplate, "");
            });
            it("should return a template when called with ({name: 'str', path: 'str'}, options)", function () {
                var prefix = "preSyncPreObject";
                var options = { knowHelpersOnly: true };
                var pretemplate = guidom.precompile({ name: prefix, path: testFileInfo.fileName1 }, options);
                testEndPretemplate(pretemplate, "");
            });
        });

        /* _-_-_-_-_-_- ASYNC METHODS _-_-_-_-_-_- */
        describe("precompile with args (array, [options], callback)", function () {
            it("should return (err, {pretemplates}) to callback when called with (array, callback)", function (done) {
                var prefix = "preAsyncArray";
                var array = [{ name: prefix + "1", path: testFileInfo.fileName1 }, { name: prefix + "2", path: testFileInfo.fileName2 }];
                guidom.precompile(array, function (err, pretemplates) {
                    if (err) return done(err);
                    for (var i = 1; i <= array.length; i++) { testEndPretemplate(pretemplates[prefix + i], prefix, i); }
                    done();
                });
            });
            it("should return (err, {pretemplates}) to callback when called with (array, options, callback)", function (done) {
                var options = { knowHelpersOnly: true };
                var prefix = "preAsyncArrayOptions";
                var array = [{ name: prefix + "1", path: testFileInfo.fileName1 }, { name: prefix + "2", path: testFileInfo.fileName2 }];
                guidom.precompile(array, options, function (err, pretemplates) {
                    if (err) return done(err);
                    for (var i = 1; i <= array.length; i++) { testEndPretemplate(pretemplates[prefix + i], prefix, i); }
                    done();
                });
            });
            it("should return (err, {pretemplates}) to callback when called whit (array, callback)", function (done) {
                var prefix = testFileInfo.fileNamePrefix;
                var array = [testFileInfo.fileName1, testFileInfo.fileName2];
                guidom.precompile(array, function (err, pretemplates) {
                    if (err) return done(err);
                    for (var i = 1; i <= array.length; i++) {
                        testEndPretemplate(pretemplates[prefix + i], prefix, i);
                    }
                    done();
                })
            });
        });

        describe("precompile with args ('name', 'path', [options], callback)", function () {
            it("should return (err, pretemplate) to callback when called with ('name', 'path', callback)", function (done) {
                var prefix = "preAsyncTwoStr";
                guidom.precompile(prefix, testFileInfo.fileName1, function (err, pretemplate) {
                    if (err) return done(err);
                    testEndPretemplate(pretemplate, prefix);
                    done();
                });
            });
            it("should return (err, pretemplate) to callback when called with ('name', 'path', options, callback)", function (done) {
                var options = { knowHelpersOnly: true };
                var prefix = "preAsyncTwoStrOptions";
                guidom.precompile(prefix, testFileInfo.fileName1, options, function (err, pretemplate) {
                    if (err) return done(err);
                    testEndPretemplate(pretemplate, prefix);
                    done();
                });
            });
        });

        describe("precompile with args: ('path', [options], callback) |or| ({path: 'str', [name: 'str']}, [options], callback)", function () {
            it("should return (err, pretemplate) to callback when called with ('path')", function (done) {
                guidom.precompile(testFileInfo.fileName1, function (err, pretemplate) {
                    if (err) return done(err);
                    testEndPretemplate(pretemplate, "");
                    done();
                });
            });
            it("should return (err, pretemplate) to callback when called with ('path', options)", function (done) {
                var options = { knowHelpersOnly: true };
                guidom.precompile(testFileInfo.fileName1, options, function (err, pretemplate) {
                    if (err) return done(err);
                    testEndPretemplate(pretemplate, "");
                    done();
                });
            });

            it("should return (err, pretemplate) to callback when called with ({name:'str', path: str}, options, callback)", function (done) {
                var prefix = "preAsyncObject";
                guidom.precompile({ path: testFileInfo.fileName1, name: prefix }, function (err, pretemplate) {
                    if (err) return done(err);
                    testEndPretemplate(pretemplate, prefix);
                    done();
                });
            });
            it("should return (err, template) to callback when called with ({name: 'str', path:'str'}, options, callback)", function (done) {
                var options = { knowHelpersOnly: true };
                var prefix = "preAsyncObjectOptions";
                guidom.precompile({ path: testFileInfo.fileName2, name: prefix }, options, function (err, pretemplate) {
                    if (err) return done(err);
                    testEndPretemplate(pretemplate, prefix)
                    done();
                });
            });
        });
    });

    /* describe("STRESS TEST", function () {
        this.timeout(0);
        it("should not leak", function () {
            var arrayTest = [];
            for (var i = 0; i < 100000; i++) {
                var ind = new String(i);
                arrayTest.push({ name: ind, path: testFileInfo.fileName1 });
            }
            guidom.compile(arrayTest);
            var objectTest = {};
            for(var i = 0; i < arrayTest.length; i++){
                var ind = new String(i);
                objectTest[ind] = guidom.templates[ind](testFileInfo.context1);
            }
            fs.writeFile("output", JSON.stringify(objectTest));
        });
    }); */

    describe("#compileDir()", function () {
        function testEndDirTemplate(templates, options) {
            var filenames = Object.keys(templates);
            for (var i = 1; i <= templates.length; i++) {
                assert.equal(filenames[i - 1], testFileInfo["fileName" + i]);
                assert.equal(templates[testFileInfo["fileName" + i]](testFileInfo["context" + i]), expected["output" + i]);
                assert.equal(guidom.templates[testFileInfo["fileName" + i]](testFileInfo["context" + i]), expected["output" + i]);
            }
        }

        /* _-_-_-_-_-_- SYNC METHODS _-_-_-_-_-_- */
        it("should read should read the contents of a directory whith arg ('dirPath') and return {templates}", function () {
            testEndDirTemplate(guidom.compileDir(testFileInfo.dirName));
        });

        it("should read should read the contents of a directory whith arg ('dirPath', options) and return {templates}", function () {
            var options = { knowHelpersOnly: true };
            testEndDirTemplate(guidom.compileDir(testFileInfo.dirName, options), options);
        });

        /* _-_-_-_-_-_- ASYNC METHODS _-_-_-_-_-_- */
        it("should read the contents of a directory whith arg ('dirPath', callback) and return (err, {templates}) to callback", function (done) {
            guidom.compileDir(testFileInfo.dirName, function (err, templates) {
                if (!err) testEndDirTemplate(templates);
                done(err);
            });
        });

        it("should read the contents of a directory whith arg ('dirPath', [options], callback) and return (err, {templates}) to callback", function (done) {
            var options = { knowHelpersOnly: true };
            guidom.compileDir(testFileInfo.dirName, options, function (err, templates) {
                if (!err) testEndDirTemplate(templates, options);
                done(err);
            });
        });
    });

    describe("#precompileDir()", function () {
        function testEndDirPretemplate(templates, options) {
            var handlebars = guidom.getHandlebars();
            var filenames = Object.keys(templates);

            for (var i = 1; i <= templates.length; i++) {
                assert.equal(filenames[i - 1], testFileInfo["fileName" + i]);
                template = (new Function("return " + template)());
                template = handlebars.template(template);
                assert.equal(template(testFileInfo["context" + i]), expected["output" + i]);
                var saved = guidom.pretemplates[prefix + savedIndex];
                saved = (new Function("return " + saved)());
                saved = handlebars.template(saved);
                assert.equal(saved(testFileInfo["context" + i]), expected["output" + i]);
            }
        }

        /* _-_-_-_-_-_- SYNC METHODS _-_-_-_-_-_- */
        it("should read should read the contents of a directory whith arg ('dirPath') and return {pretemplates}", function () {
            testEndDirPretemplate(guidom.precompileDir(testFileInfo.dirName));
        });

        it("should read should read the contents of a directory whith arg ('dirPath', options) and return {pretemplates}", function () {
            var options = { knowHelpersOnly: true };
            testEndDirPretemplate(guidom.precompileDir(testFileInfo.dirName, options), options);
        });

        /* _-_-_-_-_-_- ASYNC METHODS _-_-_-_-_-_- */
        it("should read the contents of a directory whith arg ('dirPath', callback) and return (err, {pretemplates}) to callback", function (done) {
            guidom.precompileDir(testFileInfo.dirName, function (err, pretemplates) {
                if (!err) testEndDirPretemplate(pretemplates);
                done(err);
            });
        });

        it("should read the contents of a directory whith arg ('dirPath', [options], callback) and return (err, {pretemplates}) to callback", function (done) {
            var options = { knowHelpersOnly: true };
            guidom.precompileDir(testFileInfo.dirName, options, function (err, pretemplates) {
                if (!err) testEndDirPretemplate(pretemplates, options);
                done(err);
            });
        });
    });

    describe("#saveTemplates", function () {
        it("should not save the template when set to false", function () {
            guidom.saveTemplates(false);
            var template = guidom.compile("notSaved", testFileInfo.fileName1);
            assert.equal(guidom.templates.notSaved, undefined);
            guidom.saveTemplates(true);
        });
    });
    describe("#getSaveTemplates", function () {
        it("should return true by default", function () {
            assert.equal(guidom.getSaveTemplates(), true);
        });
    });

    describe("#returnSyncTemplates", function () {
        it("should make sync .compile() return the guidom object instead of the template created", function () {
            guidom.returnSyncTemplates(false);
            assert.equal(guidom.compile("returnGuidom", testFileInfo.fileName1), guidom);
            guidom.returnSyncTemplates(true);
        });
    });
    describe("#getReturnSyncTemplates", function () {
        it("should reuturn true by default", function () {
            assert.equal(guidom.getReturnSyncTemplates(), true);
        });
    });

    describe("END", function () {
        it("delete test dir", function () {
            if (fs.existsSync(testFileInfo.fileName1)) {
                fs.unlinkSync(testFileInfo.fileName1);
            }
            if (fs.existsSync(testFileInfo.fileName2)) {
                fs.unlinkSync(testFileInfo.fileName2);
            }
            if (fs.existsSync(testFileInfo.dirCrasher)) {
                fs.rmdirSync(testFileInfo.dirCrasher);
            }
            if (fs.existsSync(testFileInfo.dirName)) {
                fs.rmdirSync(testFileInfo.dirName);
            }
        });
    });
});
