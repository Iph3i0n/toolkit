# Structs

Structs are the only way to declare data types in Unbound. They are declared as so:

```
struct User {
  username: char[];
  password: char[];
  logged_in: bool;
}
```

Once a struct is declared, it can be instaniated in a function with the following code.

```
make User {
  assign username = "testtest";
  assign password = "not a secure password";
  assign logged_in = false;
}
```

Making a struct must always have a constructor. The construct may have other code within but it must assign each variable within the struct or the compilation will fail.