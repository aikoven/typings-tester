#!/usr/bin/env node
import commander = require('commander');
import {checkDirectory, check} from './index';
const packageJson = require('../package.json');

commander
  .version(packageJson.version)
  .usage('[options] <file ...>')
  .option('-d --dir [dir]', 'Path to directory to check')
  .option('-c --config [config]', 'Path to tsconfig.json')
  .option('--bail', 'Exit on first error')
  .parse(process.argv);

if (commander['dir']) {
  try {
    checkDirectory(commander['dir'], !!commander['bail']);
  } catch (e) {
    abort(e.message);
  }
} else {
  if (commander.args.length === 0) {
    abort('No files specified');
  } else if (!commander['config']) {
    abort('No tsconfig.json path specified');
  } else {
    try {
      check(commander.args, commander['config'], !!commander['bail']);
    } catch (e) {
      abort(e.message);
    }
  }
}

function abort(message: string) {
  console.error(message);
  process.exit(1);
}
