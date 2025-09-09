import bcrypt from "bcrypt";

const ROUNDS = 10;

export async function hashPassword(plain) {
  if (!plain) return null;
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}
