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

