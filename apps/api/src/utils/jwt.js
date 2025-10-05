import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES = "1d", JWT_ISS = "kaizeninst-api" } = process.env;

export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
    issuer: JWT_ISS,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISS });
}
