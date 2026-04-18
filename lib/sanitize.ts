export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "").slice(0, 500);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
