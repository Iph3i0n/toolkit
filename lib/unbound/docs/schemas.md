# Schemas

Schema are similar to structs but they may have no concrete implementation. They may, however, be used as arguments to functions.

```
struct User {
  with username: char[];
  with last_activity: int;
}

schema ActivityData {
  with last_activity: int;
}

fn is_active(target: ActivityData, now: int): bool {
  return target.last_activity >= now - 7;
}

fn main(): int {
  store tester = make User {
    assign username = "Test User";
    assign last_activity = 5;
  }

  store is_active = tester.is_active(12);

  return 0;
}
```