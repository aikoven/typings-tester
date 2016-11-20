"use strict";
var ts = require("typescript");
function handleDiagnostics(type, diagnostics, bail) {
    if (bail === void 0) { bail = false; }
    var ret = [];
    for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
        var diagnostic = diagnostics_1[_i];
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        var text = (type + ": " + diagnostic.file.fileName + " ") +
            ("(" + (line + 1) + ", " + (character + 1) + "): " + message);
        if (bail)
            throw new Error(text);
        ret.push(text);
    }
    return ret;
}
function forEachExpectedFailureNodes(node, cb) {
    if (node.kind !== ts.SyntaxKind.SourceFile &&
        node.getFullText().match(/^\s*\/[\/*] typings:expect-error/)) {
        cb(node);
    }
    else {
        ts.forEachChild(node, function (child) {
            forEachExpectedFailureNodes(child, cb);
        });
    }
}
function check(files, tsConfigPath, bail) {
    if (bail === void 0) { bail = false; }
    var _a = ts.readConfigFile(tsConfigPath, ts.sys.readFile), config = _a.config, error = _a.error;
    if (error) {
        throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
    }
    var program = ts.createProgram(files, config.compilerOptions);
    var allErrors = [];
    var global = handleDiagnostics('Global', program.getGlobalDiagnostics(), bail);
    var syntax = handleDiagnostics('Syntactic', program.getSyntacticDiagnostics(), bail);
    allErrors.push.apply(allErrors, global.concat(syntax));
    var _loop_1 = function(sourceFile) {
        var semantic = program.getSemanticDiagnostics(sourceFile);
        if (program.getRootFileNames().indexOf(sourceFile.fileName) !== -1) {
            forEachExpectedFailureNodes(sourceFile, function (node) {
                var failures = [];
                var leftSemantics = [];
                for (var _i = 0, semantic_1 = semantic; _i < semantic_1.length; _i++) {
                    var diag = semantic_1[_i];
                    if (node.pos <= diag.start && diag.start + diag.length <= node.end) {
                        failures.push(diag);
                    }
                    else {
                        leftSemantics.push(diag);
                    }
                }
                if (failures.length === 0) {
                    var _a = sourceFile.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                    var message = ("Expected error: " + sourceFile.fileName + " ") +
                        ("(" + (line + 1) + ", " + (character + 1) + "):\n") +
                        node.getText();
                    if (bail)
                        throw new Error(message);
                    allErrors.push(message);
                }
                semantic = leftSemantics;
            });
        }
        allErrors.push.apply(allErrors, handleDiagnostics('Semantic', semantic, bail));
    };
    for (var _i = 0, _b = program.getSourceFiles(); _i < _b.length; _i++) {
        var sourceFile = _b[_i];
        _loop_1(sourceFile);
    }
    if (allErrors.length > 0)
        throw new Error(allErrors.join('\n\n'));
}
exports.check = check;
function checkDirectory(path, bail) {
    if (bail === void 0) { bail = false; }
    var files = ts.sys.readDirectory(path, ['.ts', '.tsx']);
    var tsConfigPath = ts.findConfigFile(path, ts.sys.fileExists);
    check(files, tsConfigPath, bail);
}
exports.checkDirectory = checkDirectory;
