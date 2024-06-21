import { describe, test } from "node:test";
import assert from "node:assert";
import { SsoClient } from "../clients/sso";

describe("Auth", () => {
  const sso = new SsoClient();

  test("Creates a basic user", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: "creates_a_basic_user@test.com",
      password: "test123",
    });

    const profile = await sso.GetPublicProfile(user.UserId);

    assert.equal(profile.UserId, user.UserId);
    assert.equal(profile.UserName, "test_user");
    assert.equal(profile.Biography, "");
  });
});
