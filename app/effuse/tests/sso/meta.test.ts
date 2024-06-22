import { describe, test } from "node:test";
import assert from "node:assert";
import { SsoClient } from "../clients/sso";

describe("Meta", () => {
  const sso = new SsoClient();

  test("Displays the correct cors headers", async () => {
    const options = await sso.HeartBeatOptions();

    assert.equal(options["access-control-allow-origin"], process.env.UI_URL);
    assert.equal(
      options["access-control-allow-methods"],
      "OPTIONS, GET, PUT, POST, DELETE"
    );
    assert.equal(
      options["access-control-allow-headers"],
      "Authorization, Content-Type"
    );

    const get = await sso.HeartBeat();

    assert.equal(get["access-control-allow-origin"], process.env.UI_URL);
    assert.equal(
      get["access-control-allow-methods"],
      "OPTIONS, GET, PUT, POST, DELETE"
    );
    assert.equal(
      get["access-control-allow-headers"],
      "Authorization, Content-Type"
    );
  });
});
