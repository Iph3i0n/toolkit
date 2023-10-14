# If Statements

If statments use standard C syntax but, like all blocks in Unbound, they must return a value. This means that all if statements must be accompanied by an else statement. As an if statement is declared within a proceedural flow (within a function) it must be followed by a semi colon.

```
fn test(input: bool): int {
  store result = if (input) {
    return 123;
  } else {
    return 456;
  };

  return result;
}
```