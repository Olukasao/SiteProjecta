export type UserRole = "dev" | "admin" | "editor";

export type AdminUser = {
  id?: number;
  role?: UserRole | string;
} | null | undefined;

export function isDev(user: AdminUser) {
  return user?.role === "dev";
}

export function isAdminLike(user: AdminUser) {
  return user?.role === "admin" || user?.role === "dev";
}

export function canManageUsers(user: AdminUser) {
  return isAdminLike(user);
}

export function canDeleteProperties(user: AdminUser) {
  return isAdminLike(user);
}

export function canChangeUser(currentUser: AdminUser, targetUser: AdminUser) {
  if (!canManageUsers(currentUser)) return false;
  if (isDev(currentUser)) return true;
  return targetUser?.role === "editor";
}

export function canDeleteUser(currentUser: AdminUser, targetUser: AdminUser) {
  return canChangeUser(currentUser, targetUser) && currentUser?.id !== targetUser?.id;
}
