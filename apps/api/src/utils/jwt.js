import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES = "1d", JWT_ISS = "kaizeninst-api" } = process.env;

/**
 * สร้าง JWT สำหรับ admin หรือ staff
 * @param {object} user - ข้อมูลผู้ใช้จากฐานข้อมูล
 * @returns {string} token - access token
 */
export function signAdminToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    must_change_password: Boolean(user.must_change_password),
  };

  console.log(user.must_change_password, typeof user.must_change_password);

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
    issuer: JWT_ISS,
  });
}

/**
 * ตรวจสอบและถอดรหัส JWT
 * @param {string} token - access token
 * @returns {object} payload - ข้อมูลใน token
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISS });
}
