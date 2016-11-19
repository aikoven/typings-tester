"use strict";
var ts = require("typescript");
function handleDiagnostics(type, diagnostics) {
    for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
        var diagnostic = diagnostics_1[_i];
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        throw new Error((type + ": " + diagnostic.file.fileName + " ") +
            ("(" + (line + 1) + ", " + (character + 1) + "): " + message));
    }
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
function check(files, tsConfigPath) {
    var _a = ts.readConfigFile(tsConfigPath, ts.sys.readFile), config = _a.config, error = _a.error;
    if (error) {
        throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
    }
    var program = ts.createProgram(files, config.compilerOptions);
    handleDiagnostics('Global', program.getGlobalDiagnostics());
    handleDiagnostics('Syntactic', program.getSyntacticDiagnostics());
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
                    throw new Error(("Expected error: " + sourceFile.fileName + " ") +
                        ("(" + (line + 1) + ", " + (character + 1) + "):\n") +
                        node.getText());
                }
                semantic = leftSemantics;
            });
        }
        handleDiagnostics('Semantic', semantic);
    };
    for (var _i = 0, _b = program.getSourceFiles(); _i < _b.length; _i++) {
        var sourceFile = _b[_i];
        _loop_1(sourceFile);
    }
}
exports.check = check;
function checkDirectory(path) {
    var files = ts.sys.readDirectory(path, ['.ts', '.tsx']);
    var tsConfigPath = ts.findConfigFile(path, ts.sys.fileExists);
    check(files, tsConfigPath);
}
exports.checkDirectory = checkDirectory;
