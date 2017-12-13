function f(a: number) {
  a = 1;
}

/* typings:expect-error */
{
  const a: number = '';
}

// typings:expect-error
function shouldFail(a: number) {
  a = '';
}

{
  // typings:expect-error
  const a: string = 1;
}

{
  // Ensure that all test files are compiled one-by-one and the global constant
  // declared in global.ts is not in the scope.
  // See ./global.ts for rationale
  // typings:expect-error
  const a = someGlobal;
}
