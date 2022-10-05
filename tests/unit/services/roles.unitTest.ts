import Role, { getLegacyRoles } from "../../../src/services/roles";

describe("getLegacyRoles()", () => {
  it("should return list of valid roles if there are any", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["name1.read", "name2.WRITE"]), {});
    expect(roles.length).toEqual(2);

    expect(roles).toContainEqual({
      name: "name1",
      access: "read",
    });
    expect(roles).toContainEqual({
      name: "name2",
      access: "write",
    });
  });

  it("should return list of valid roles for TechRecord.View", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["TechRecord.View"]), {});
    expect(roles.length).toEqual(1);

    expect(roles).toContainEqual({
      name: "TechRecord",
      access: "view",
    });
  });

  it("should return backwards-compatible roles with write access", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["CVSFullAccess"]), {});

    expect(roles.length).toEqual(1);

    expect(roles).toContainEqual({
      name: "CVSFullAccess",
      access: "write",
    });
  });

  it("should return empty list if no roles on token", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles([]), {});

    expect(roles.length).toEqual(0);
  });

  it("should return empty list if invalid role", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["invalid"]), {});

    expect(roles.length).toEqual(0);
  });

  it("should return empty list if too many parts", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["part1.part2.part3"]), {});

    expect(roles.length).toEqual(0);
  });

  it("should return empty list if null name", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles([".read"]), {});

    expect(roles.length).toEqual(0);
  });

  it("should return empty list if null access", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["name."]), {});

    expect(roles.length).toEqual(0);
  });

  it("should return empty list if both parts null", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["."]), {});

    expect(roles.length).toEqual(0);
  });

  it("should return empty list if access incorrect", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["name.not-read-and-not-write"]), {});

    expect(roles.length).toEqual(0);
  });

  it("should consider name case-sensitive", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["NaMe.read", "nAmE.read"]), {});

    expect(roles.length).toEqual(2);

    expect(roles).toContainEqual({
      name: "NaMe",
      access: "read",
    });
    expect(roles).toContainEqual({
      name: "nAmE",
      access: "read",
    });
  });

  it("should consider access case-insensitive", () => {
    const roles: Role[] = getLegacyRoles(tokenWithRoles(["name.READ", "name.WRITE"]), {});

    expect(roles.length).toEqual(2);

    expect(roles).toContainEqual({
      name: "name",
      access: "read",
    });
    expect(roles).toContainEqual({
      name: "name",
      access: "write",
    });
  });

  const tokenWithRoles = (roles: string[]): any => {
    return {
      payload: {
        roles,
      },
    };
  };
});
