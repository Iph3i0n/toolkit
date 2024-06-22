import { describe, test } from "node:test";
import assert from "node:assert";
import { SsoClient } from "../clients/sso";
import { CreateEmail } from "../utils/email";

describe("Identity", () => {
  const sso = new SsoClient();

  test("Identifies a user", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: CreateEmail(),
      password: "test123",
    });

    const user_id = await sso.GetUserFromToken(user);

    assert.equal(user_id, user.UserId);
  });
});
