# Namespaces

All code in an unbound project must be within a namespace. They are declared like so.

```
namespace TestNamespace {
  // Function and Struct declarations go here
}
```

Code within a namespace may then be called with:

```
TestNamespace.test(123, false);
```

A namespace may also be used within another namespace. This may be done with:

```
namespace OtherNamespace {
  using TestNamespace;

  fn some_function(): int {
    return test(123, false);
  }
}
```