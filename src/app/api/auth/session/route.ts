import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent") || "Unknown Browser Agent";

  // Resolve best candidate IP
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : realIp || "127.0.0.1";

  // Parse User-Agent for OS
  let os = "Unknown OS";
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
  else if (/linux/i.test(userAgent)) os = "Linux";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

  // Parse User-Agent for Browser
  let browser = "Web Browser";
  if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Mozilla Firefox";
  else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = "Apple Safari";
  else if (/edge|edg/i.test(userAgent)) browser = "Microsoft Edge";
  else if (/opera|opr/i.test(userAgent)) browser = "Opera";

  // Parse device type
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/mobile/i.test(userAgent)) deviceType = "mobile";
  else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";

  return NextResponse.json({
    success: true,
    client: {
      ip: clientIp,
      browser,
      os,
      deviceType,
      userAgent,
      detectedAt: new Date().toISOString(),
      location: clientIp === "127.0.0.1" ? "Localhost (Development)" : "Dynamic Regional Network",
    },
  });
}
