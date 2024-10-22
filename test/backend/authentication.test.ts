import app from "../../src/backend/src/app";

describe("authentication", () => {
  xit("registered the authentication service", () => {
    expect(app.service("authentication")).toBeTruthy();
  });

  describe("local strategy", () => {
    const userInfo = {
      email: "someone@example.com",
      password: "supersecret",
    };

    beforeAll(async () => {
      try {
        await app.service("users").create(userInfo);
      } catch (error) {
        // Do nothing, it just means the user already exists and can be tested
      }
    });

    xit("authenticates user and creates accessToken", async () => {
      const { user, accessToken } = await app.service("authentication").create(
        {
          strategy: "local",
          ...userInfo,
        },
        {}
      );

      expect(accessToken).toBeTruthy();
      expect(user).toBeTruthy();
    });
  });
});
