module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "next/core-web-vitals", // สำหรับ Next.js
    "prettier", // ปิดกฎที่ซ้ำกับ prettier
  ],
  rules: {
    "no-unused-vars": "warn", // ตัวแปรไม่ได้ใช้ แค่เตือน
    "no-console": "off", // อนุญาตให้ใช้ console.log
    semi: ["warn", "always"], // ลืม ; แค่เตือน
    quotes: ["warn", "double"], // อยากให้ใช้ " แต่ถ้าพลาดก็แค่เตือน
    "react/react-in-jsx-scope": "off", // Next.js ไม่ต้อง import React
  },
};
