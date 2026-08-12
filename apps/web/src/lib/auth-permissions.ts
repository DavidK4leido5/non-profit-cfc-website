import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/** Keep in sync with apps/auth/src/permissions.ts */
const statement = {
  ...defaultStatements,
  branch: ["create", "update", "read", "list"],
  account: ["list", "manage"],
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  branch: [],
  account: [],
});

export const branchAdminRole = ac.newRole({
  branch: ["create", "update", "read"],
  account: ["list", "manage"],
});

export const superAdminRole = ac.newRole({
  ...adminAc.statements,
  branch: ["create", "update", "read", "list"],
  account: ["list", "manage"],
});

export const authRoles = {
  user: userRole,
  branch_admin: branchAdminRole,
  super_admin: superAdminRole,
} as const;
