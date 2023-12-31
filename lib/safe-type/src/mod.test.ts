import {
  IsString,
  IsNumber,
  IsSymbol,
  IsBoolean,
  IsFunction,
  IsDate,
  IsLiteral,
  IsArray,
  IsUnion,
  IsObject,
  IsIntersection,
  IsDictionary,
  Optional,
  DoNotCare,
  Assert,
  IsTuple,
  PatternMatch,
  IsRecord,
  IsIterable,
  IsInstanceOf,
} from "./mod";

class BaseTest {}

class Test1 extends BaseTest {}

class Test2 extends BaseTest {}

for (const [name, data, checker] of [
  ["IsString", "test string" as any, IsString as any],
  ["IsNumber", 123, IsNumber],
  ["IsSymbol", Symbol(123), IsSymbol],
  ["IsBoolean", false, IsBoolean],
  ["IsFunction", () => {}, IsFunction],
  ["IsDate", new Date(2000, 1, 1), IsDate],
  ["IsLiteral", "Literal", IsLiteral("Literal")],
  ["IsArray of numbers", [1, 2, 3, 4], IsArray(IsNumber)],
  ["IsArray of strings", ["1", "2"], IsArray(IsString)],
  [
    "IsUnion of Test or 123 p1",
    "Test",
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  [
    "IsUnion of Test or 123 p2",
    123,
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  ["IsObject with number", { test: 123 }, IsObject({ test: IsNumber })],
  ["IsObject with optional number", {}, IsObject({ test: Optional(IsNumber) })],
  [
    "IsIntersection",
    { test: 123, other: "test" },
    IsIntersection(IsObject({ test: IsNumber }), IsObject({ other: IsString })),
  ],
  [
    "IsIntersection with dictionary",
    { test: 123, other: "test" },
    IsIntersection(IsDictionary(IsNumber), IsObject({ other: IsString })),
  ],
  [
    "IsIntersection with dictionary of objects and null other item",
    { test: { id: 1 }, other: null },
    IsIntersection(
      IsDictionary(IsObject({ id: IsNumber })),
      IsObject({ other: Optional(IsString) })
    ),
  ],
  [
    "IsDictionary of numbers",
    { test: 123, other: 321 },
    IsDictionary(IsNumber),
  ],
  [
    "IsDictionary of string",
    { test: "123", other: "321" },
    IsDictionary(IsString),
  ],
  ["Optional", undefined, Optional(IsNumber)],
  ["DotNotCare on string", "test", DoNotCare],
  ["DoNotCare on date", Date.UTC(2000, 1, 1), DoNotCare],
  ["Tuple", ["test", 123], IsTuple(IsString, IsNumber)],
  ["Tuple or numbers", [1, 2], IsTuple(IsNumber, IsNumber)],
  ["Array of tuple or numbers", [[1, 2]], IsArray(IsTuple(IsNumber, IsNumber))],
  ["An empty dictionary", {}, IsDictionary(IsString)],
  ["An empty string in a dictionary", { test: "" }, IsDictionary(IsString)],
  ["An empty record", {}, IsRecord(IsString, IsString)],
  [
    "A record of strings",
    { "1": "test", "2": "test" },
    IsRecord(IsString, IsString),
  ],
  [
    "A record of literals",
    { t1: "test", t2: "test" },
    IsRecord(IsUnion(IsLiteral("t1"), IsLiteral("t2")), IsString),
  ],
  [
    "A record of string and null",
    { part1: null },
    IsRecord(IsString, DoNotCare),
  ],
  [
    "An iterable",
    (function* () {
      yield 1;
      yield 2;
      yield 3;
    })(),
    IsIterable(IsNumber),
  ],
  ["A class instance", new Test1(), IsInstanceOf(Test1)],
  ["An inherited class", new Test2(), IsInstanceOf(BaseTest)],
]) {
  it(`Correctly assignes to true for ${name}`, () => {
    expect(checker(data)).toBe(true);
  });
}

for (const [name, data, checker] of [
  ["IsString", 123 as any, IsString as any],
  ["IsNumber", "test string", IsNumber],
  ["IsSymbol", 123, IsSymbol],
  ["IsBoolean", 123, IsBoolean],
  ["IsFunction", 123, IsFunction],
  ["IsDate", 123, IsDate],
  ["IsLiteral", "No Literal", IsLiteral("Literal")],
  ["IsArray of numbers", ["1", "2"], IsArray(IsNumber)],
  ["IsArray of strings", [1, 2, 3, 4], IsArray(IsString)],
  [
    "IsUnion of Test or 123 p1",
    "Not a test",
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  [
    "IsUnion of Test or 123 p2",
    321,
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  [
    "IsObject with number",
    { test: "test string" },
    IsObject({ test: IsNumber }),
  ],
  [
    "IsIntersection",
    { test: "test string", other: 123 },
    IsIntersection(IsObject({ test: IsNumber }), IsObject({ other: IsString })),
  ],
  [
    "IsIntersection with dictionary",
    { other: "test" },
    IsIntersection(IsDictionary(IsNumber), IsObject({ other: IsString })),
  ],
  [
    "IsDictionary of numbers",
    { test: "123", other: 321 },
    IsDictionary(IsNumber),
  ],
  ["Optional", false, Optional(IsNumber)],
  ["Tuple", [123, "test"], IsTuple(IsString, IsNumber)],
  ["Tuple", ["test", 123, "another"], IsTuple(IsString, IsNumber)],
  [
    "A record of literals",
    { t1: "test", wrong_test: "test" },
    IsRecord(IsUnion(IsLiteral("t1"), IsLiteral("t2")), IsString),
  ],
  [
    "A deep object",
    {},
    IsObject({
      "@": IsObject({
        "@_attr": IsUnion(
          IsObject({ on: IsString }),
          IsObject({ trigger: IsString, selector: IsString })
        ),
      }),
    }),
  ],
  ["An incorrect instance of class", new Test2(), IsInstanceOf(Test1)],
]) {
  it(`Correctly assignes to false for ${name}`, () => {
    expect(checker(data)).toBe(false);
  });
}

it("Throws error for assert", () => {
  expect(() => Assert(IsString, 123)).toThrow();
});

it("Does not throw if correct type", () => {
  Assert(IsString, "123");
});

it("Does not throw if correct type deep", () => {
  Assert(IsObject({ parameter: IsString }), { parameter: "test" });
});

it("Matches on pattern", () => {
  const pattern = PatternMatch(IsString, IsNumber, IsBoolean);
  const matcher = pattern(
    (s) => s + "string",
    (n) => n + "number",
    (b) => b + "boolean"
  );
  expect(matcher("test")).toBe("teststring");
});

it("Matches on other pattern", () => {
  expect(
    PatternMatch(IsString, IsNumber, IsBoolean)(
      (s) => s + "string",
      (n) => n + "number",
      (b) => b + "boolean"
    )(123)
  ).toBe("123number");
});

it("Matches on an intersection of unions", () => {
  const checker = IsIntersection(
    IsObject({
      thing: IsString,
    }),
    IsUnion(
      IsObject({ test: IsString }),
      IsIntersection(
        IsObject({ test: IsString }),
        IsObject({ other: IsString })
      )
    )
  );
  expect(checker({ thing: "test", test: "other", other: "test" })).toBe(true);
  expect(checker({ thing: "test", test: "other" })).toBe(true);
  expect(checker({ thing: "test" })).toBe(false);
  expect(checker({ test: "other" })).toBe(false);
});
