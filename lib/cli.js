#!/usr/bin/env node
"use strict";
var commander = require("commander");
var index_1 = require("./index");
var packageJson = require('../package.json');
commander
    .version(packageJson.version)
    .usage('[options] <file ...>')
    .option('-d --dir [dir]', "Path to directory to check")
    .option('-c --config [config]', "Path to tsconfig.json")
    .parse(process.argv);
if (commander['dir']) {
    try {
        index_1.checkDirectory(commander['dir']);
    }
    catch (e) {
        abort(e.message);
    }
}
else {
    if (commander.args.length === 0) {
        abort('No files specified');
    }
    else if (!commander['config']) {
        abort('No tsconfig.json path specified');
    }
    else {
        try {
            index_1.check(commander.args, commander['config']);
        }
        catch (e) {
            abort(e.message);
        }
    }
}
function abort(message) {
    console.error(message);
    process.exit(1);
}
