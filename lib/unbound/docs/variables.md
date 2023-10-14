# Variables

Variables may be created and accessed within functions. All variables are deeply immutable so we may not write anything after creation. A variable may be pointed to new memory. All memory is cleaned up when the variable scope that the variable was declared in finishes, unless a variable is returned from the function, in which case will be bound to the scope of the invoking function.

```
fn something(): int {
  store test = 123;

  test = 456;
  return test;
}
```