export function getCorsOptions(frontendOrigin) {
  const origins = frontendOrigin.split(",").map((s) => s.trim());

  return {
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
