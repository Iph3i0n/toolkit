import { describe, test } from "node:test";
import assert from "node:assert";
import Fs from "node:fs/promises";
import Path from "node:path";
import { SsoClient } from "../clients/sso";
import { CreateEmail } from "../utils/email";

async function LoadProfilePicture() {
  return {
    base64data: Buffer.from(
      await Fs.readFile(
        Path.resolve(__dirname, "../assets/profile-picture.png")
      )
    ).toString("base64"),
    mime_type: "picture/png",
  };
}

describe("Profile", () => {
  const sso = new SsoClient();

  test("Updates the public profile", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: CreateEmail(),
      password: "test123",
    });

    await sso.PutProfile(
      {
        user_name: "test user",
        biography: "I love my wife!!!",
        picture: await LoadProfilePicture(),
      },
      user
    );

    const profile = await sso.GetPublicProfile(user.UserId);
    assert.equal(profile.UserId, user.UserId);
    assert.equal(profile.Biography, "I love my wife!!!");
    assert.equal(profile.UserName, "test user");
  });

  test("Updates the private profile", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: CreateEmail(),
      password: "test123",
    });

    await sso.PutProfile(
      {
        user_name: "test user",
        biography: "I love my wife!!!",
        picture: await LoadProfilePicture(),
      },
      user
    );

    const profile = await sso.GetProfile(user);
    assert.equal(profile.UserId, user.UserId);
    assert.equal(profile.Biography, "I love my wife!!!");
    assert.equal(profile.UserName, "test user");
    assert.deepEqual(profile.Servers, []);
    assert.equal(typeof profile.LastSignIn.getTime(), "number");
    assert.equal(typeof profile.RegisteredAt.getTime(), "number");
  });

  const server_url = process.env.SERVER_URL;
  if (server_url)
    test("Joins a server", async () => {
      const user = await sso.PostUser({
        user_name: "test_user",
        email: CreateEmail(),
        password: "test123",
      });

      await sso.PostServer(
        {
          server_url: server_url,
          password: process.env.SERVER_PASSWORD,
        },
        user
      );

      const profile = await sso.GetProfile(user);
      assert.equal(profile.UserId, user.UserId);
      assert.equal(profile.Biography, "I love my wife!!!");
      assert.equal(profile.UserName, "test user");
      assert.equal(profile.Servers.length, 1);
      const [server] = profile.Servers;
      assert.equal(typeof server.JoinedAt.getTime(), "number");
      assert.equal(server.Url, server_url);
      assert.equal(typeof profile.LastSignIn.getTime(), "number");
      assert.equal(typeof profile.RegisteredAt.getTime(), "number");
    });
});
