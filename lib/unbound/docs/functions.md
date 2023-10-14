# Functions

Functions are declared with the following syntax.

```
fn test(arg1: int, arg2: bool): char {
  // Function body goes here
}
```

A function may then be called with:

```
test(123, false);
```

A function may only be declared at the namespace scope but a function may be partially invoked at any point in the code with:

```
bind bound_test = test(123);
```

This function may then be called as before:

```
bound_test(false);
```

Functions may also be invoked as a method of the first argument.

```
123.test(false);
```

This is useful for making fluent APIs. This may only be done when using the namespace that contains the function. If more than one of the used namespaces expose the same function signature then an ambiguous function invokation will be declared at compile time. This must either be resolved by using the full function invokation with namespace or by binding the function to a new name. This can be done like so.

```
// Option 1
Namespace.test(123, false);

// Option 2
bind desired_test = Namespace.test();
123.desired_test(false);
```

Like all blocks in Unbound, a function must return a value.