import { describe, test } from "node:test";
import assert from "node:assert";
import { SsoClient } from "../clients/sso";
import { CreateEmail } from "../utils/email";

describe("Push Subscriptions", () => {
  const sso = new SsoClient();

  test("Adds a subscription", async () => {
    const user = await sso.PostUser({
      user_name: "test_user",
      email: CreateEmail(),
      password: "test123",
    });

    await sso.PostPushSubscription(
      {
        endpoint: "https://app.effuse.cloud/",
        expires: new Date("2020-01-01"),
        keys: { Test: "Hello" },
      },
      user
    );

    const subscriptions = await sso.GetPushSubscriptions(user);
    assert.equal(subscriptions.length, 1);
    const [subscription] = subscriptions;
    assert.equal(subscription.Endpoint, "https://app.effuse.cloud/");
    assert.equal(
      subscription.Expires.getTime(),
      new Date("2020-01-01").getTime()
    );
    assert.deepEqual(subscription.Keys, { Test: "Hello" });
  });
});
