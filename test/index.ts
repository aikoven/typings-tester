import test = require("tape");
import {check, checkDirectory} from '../src/index';
import {join} from "path";


test('check', assert => {
  assert.doesNotThrow(() => {
    check([join(__dirname, 'files/test.ts')],
      join(__dirname, 'files/tsconfig.json'));
  });

  assert.throws(() => {
    check([join(__dirname, 'failing/expected.ts')],
      join(__dirname, 'failing/tsconfig.json'));
  }, /Expected error:.*\(2, 1\)/);

  assert.throws(() => {
    check([join(__dirname, 'failing/unexpected.ts')],
      join(__dirname, 'failing/tsconfig.json'));
  }, /Semantic:.*\(2, 9\)/);

  assert.end();
});


test('checkDirectory', assert => {
  assert.doesNotThrow(() => {
    checkDirectory(join(__dirname, 'files'));
  });

  assert.end();
});
