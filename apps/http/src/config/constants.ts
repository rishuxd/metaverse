export const config = {
  port: Number(process.env.PORT) || 7002,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-here",
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: [
    "https://spaces.rishuffled.in",
    "https://www.spaces.rishuffled.in",
    "http://localhost:3000",
    "http://localhost:7001",
  ],
};
