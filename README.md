# Typings Tester [![npm version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

A library aimed to aid testing of TypeScript definitions. 
Checks TypeScript files for syntactic, expected and unexpected semantic (type) errors.

**Note:** _There's an [official tool](https://github.com/Microsoft/dtslint#write-tests) that provides similar functionality and might be a better choice._

## Installation
 
    $ npm install -D typings-tester
    
Any version of TypeScript must be installed separately.

## CLI Usage

    $ typings-tester --config path/to/tsconfig.json **/*.ts
     
    $ typings-tester --dir path/to/directory
    
## API Usage            

```ts
import test from "tape";
import {check, checkDirectory} from "typings-tester";


test('typings', assert => {
  assert.doesNotThrow(() => check(['test.ts'], 'tsconfig.json'));
  
  assert.doesNotThrow(() => checkDirectory('src'));
});
```

## Flags
* `typings:expect-error`: expect next line or block to contain semantic error. `typings-tester` will fail if no error is produced.

```ts
// typings:expect-error
function shouldFail(a: number): string {
  return a;
}
```

## What's next

* Testing against multiple versions of TypeScript
* Inferred type assertions

[npm-image]: https://badge.fury.io/js/typings-tester.svg
[npm-url]: https://badge.fury.io/js/typings-tester
[travis-image]: https://travis-ci.org/aikoven/typings-tester.svg?branch=master
[travis-url]: https://travis-ci.org/aikoven/typings-tester
