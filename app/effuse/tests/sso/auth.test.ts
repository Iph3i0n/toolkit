import { describe, test } from "node:test";
import assert from "node:assert";
import { SsoClient } from "../clients/sso";
import { CreateEmail } from "../utils/email";

describe("Auth", () => {
  const sso = new SsoClient();

  test("Creates a basic user", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: CreateEmail(),
      password: "test123",
    });

    const profile = await sso.GetPublicProfile(user.UserId);

    assert.equal(profile.UserId, user.UserId);
    assert.equal(profile.UserName, "test_user");
    assert.equal(profile.Biography, "");
  });

  test("Allows private actions with admin", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: CreateEmail(),
      password: "test123",
    });

    const profile = await sso.GetProfile(user);

    assert.equal(profile.UserId, user.UserId);
    assert.equal(profile.UserName, "test_user");
    assert.equal(profile.Biography, "");
    assert.deepEqual(profile.Servers, []);
    assert.equal(typeof profile.LastSignIn.getTime(), "number");
    assert.equal(typeof profile.RegisteredAt.getTime(), "number");
  });

  test("Allows login", async () => {
    const email = CreateEmail();
    const user = await sso.PostUser({
      user_name: "test_user",
      email: email,
      password: "test123",
    });

    const login = await sso.GetToken(email, "test123");

    const profile = await sso.GetProfile(login);

    assert.equal(profile.UserId, user.UserId);
    assert.equal(profile.UserName, "test_user");
    assert.equal(profile.Biography, "");
    assert.deepEqual(profile.Servers, []);
    assert.equal(typeof profile.LastSignIn.getTime(), "number");
    assert.equal(typeof profile.RegisteredAt.getTime(), "number");
  });
});
