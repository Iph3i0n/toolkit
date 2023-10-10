import {
  Read,
  Write,
  ISerialiseable,
  ASCII,
  Struct,
  Array,
  Union,
  Int,
  Record,
  UTF8,
  UInt,
  Buffer as BufferSchema,
  DateTime,
} from "./mod";

function Perform<TSchema>(schema: ISerialiseable<TSchema>, input: TSchema) {
  return () => {
    const result = Read(schema, Write(schema, input));

    expect(result).toEqual(input);
  };
}

test("Performs a basic string", Perform(new ASCII(), "Hello world"));

test(
  "Performs a UTF-8 string",
  Perform(new UTF8(), "Basic Test 私はパールづそ")
);

test(
  "Performs a complex struct",
  Perform(
    new Struct({
      test: new ASCII(),
    }),
    {
      test: "Hello world",
    }
  )
);

test(
  "Builds a union",
  Perform(new Array(new Union(new ASCII(), new Int())), ["hello world", 123])
);

test(
  "Builds a record",
  Perform(new Record(new UTF8(), new UInt()), { test_1: 1, test_2: 4 })
);

test("Builds a buffer", () => {
  const schema = new Struct({
    data: new BufferSchema(),
    name: new ASCII(),
  });

  const data_bytes = [1, 2, 3, 4];

  const result = Read(
    schema,
    Write(schema, {
      data: new Uint8Array(data_bytes),
      name: "Test Name",
    })
  );

  expect([...new Uint8Array(result.data)]).toEqual(data_bytes);
  expect(result.name).toEqual("Test Name");
});

test("Parses time", () => {
  const schema = new Struct({
    now: new DateTime(),
  });

  const now = new Date();

  const result = Read(schema, Write(schema, { now }));

  expect(result.now.getTime()).toEqual(now.getTime());
});
