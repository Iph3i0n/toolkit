# Loops and Iterators

## Iterators

Iterators are sequences of data. Those sequences are retrieved upon request. In the case of iterators made within code, the code for the next item is only run upon request. In the case of arrays, the next request will simply pull the data from the memory address of the next item.

Iterators of a type are declared by putting a pair of square brackets after the type name.

## Loops

Like all over blocks in Unbound. Loops must return a value. That value will be an iterator. Each iteration of the loop will only be run when the next item of that loop is requested. As such, loops are not actually run when declared, but the scope of the function will be preserved until the iterator is finished.

## While Loops

While loops evaluate the expression provided using the scope that they were declared within. They can theoretically run forever if provided with the `true` keyword in the expression section.

```
fn test(): int[] {
  store indexer = 0;
  store result = while (indexer < 10) {
    indexer += 1;

    return indexer;
  }

  return result;
}
```

## Iterator Loops

Iterator loops are designed to iterate over other iterators. Otherwise they work much the same way as a while loop.

```
fn test(): int[] {
  store iterator = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  store result = iterate (iterator) as (item) {
    return item + 1;
  }

  return result;
}
```

## Count Loops

Count loops are for when you want to perform an operation for a fixed number of times. We avoid for loops because they break principles of purity.

```
fn test(): int[] {
  store result = count (10) {
    return 1;
  }

  return result;
}
```