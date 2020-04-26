import app from "../../../src/backend/src/app";

describe("'users' service", () => {
  it("registered the service", () => {
    const service = app.service("users");
    expect(service).toBeTruthy();
  });
});
