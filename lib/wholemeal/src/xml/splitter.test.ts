import { describe, test } from "node:test";
import assert from "node:assert";
import { SplitCode } from "./splitter";

describe("SplitCode", () => {
  test("splits a simple script", () => {
    const result = SplitCode(`<script>Hello world</script><test>hello</test>`);

    assert.deepEqual(result, [
      "<script>Hello world</script>",
      "<",
      "test",
      ">",
      "hello",
      "</",
      "test",
      ">",
    ]);
  });

  test("splits an on script", () => {
    const result = SplitCode(
      `<script on="test">Hello world</script><test>hello</test>`
    );

    assert.deepEqual(result, [
      '<script on="test">Hello world</script>',
      "<",
      "test",
      ">",
      "hello",
      "</",
      "test",
      ">",
    ]);
  });

  test("splits a double script", () => {
    const result = SplitCode(
      `<script>Hello world</script><script on="test">Hello world</script><test>hello</test>`
    );

    assert.deepEqual(result, [
      "<script>Hello world</script>",
      '<script on="test">Hello world</script>',
      "<",
      "test",
      ">",
      "hello",
      "</",
      "test",
      ">",
    ]);
  });
});
