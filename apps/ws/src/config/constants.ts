export const config = {
  wsPort: Number(process.env.WS_PORT) || 7003,
  httpPort: Number(process.env.HTTP_PORT) || 7004,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-here",
  corsOrigins: [
    "https://spaces.rishuffled.in",
    "https://www.spaces.rishuffled.in",
    "http://localhost:3000",
    "http://localhost:7001",
  ],
};
