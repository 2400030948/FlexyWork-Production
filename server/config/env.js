const isProduction = process.env.NODE_ENV === "production";

const requiredInProduction = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLIENT_ORIGIN"
];

export function validateEnv() {
  const missing = requiredInProduction.filter((key) => !process.env[key]?.trim());
  if (isProduction && missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  if (isProduction && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be at least 32 characters in production");
    process.exit(1);
  }

  if (isProduction && !process.env.SMTP_USER?.trim()) {
    console.error("SMTP_USER and SMTP_PASS are required in production for email OTP delivery");
    process.exit(1);
  }

  if (isProduction && !process.env.SMTP_PASS?.trim()) {
    console.error("SMTP_USER and SMTP_PASS are required in production for email OTP delivery");
    process.exit(1);
  }
}

export function getClientOrigins() {
  const raw = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
}

export { isProduction };
