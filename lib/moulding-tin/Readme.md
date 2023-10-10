# Moulding Tin

A simple tool to declare and serialise structs using Deno.

Simply:

```TypeScript
import {
  Read,
  Write,
  Struct,
  ASCII,
  Long,
  Serialised
} from "https://deno.land/x/moulding_tin@LATEST/mod";

const DataType = new Struct({
  a_string: new ASCII(),
  a_big_integer: new Long(),
});

App.onGotData((data: Buffer) => {
  const deserialised = Read(DataType, data);

  // Do something with your data
});

export function SendData(data: Serialised<T>) {
  const buffer = Write(DataType, data);

  // Do something with your buffer
}
```

## Why is this useful?

JSON is pretty large. This library can store an 8 boolean object in one number. This is good for passing data around micro services, storing data on the disk, and many other things of this nature.

## What are the down sides?

You must have a rigid contract. If not then the data will not be readable.
