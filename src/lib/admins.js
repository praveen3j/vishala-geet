export const ADMIN_USERS = [
  { email: "praveenjav@outlook.com", name: "Praveen" },
  { email: "vishala1966@gmail.com", name: "Vishala" }
];

export function adminForEmail(email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  return ADMIN_USERS.find((admin) => admin.email.toLowerCase() === normalizedEmail) || null;
}

export function isAdminUser(user) {
  return Boolean(adminForEmail(user?.email));
}
