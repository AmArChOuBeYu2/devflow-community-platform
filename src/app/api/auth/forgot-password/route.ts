import { NextRequest, NextResponse } from "next/server";
import { initialUsers } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, isEmail } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email or phone number." },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\s+/g, "");

    const matched = initialUsers.find((u) =>
      isEmail
        ? u.email.toLowerCase() === cleanId
        : u.phone.replace(/\s+/g, "") === cleanPhone
    );

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          message: `No registered account found with this ${isEmail ? "email address" : "mobile phone number"}.`,
        },
        { status: 404 }
      );
    }

    // Letters-only password generator helper strictly [A-Za-z]
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const all = upper + lower;
    let generatedPass = "";
    generatedPass += upper[Math.floor(Math.random() * upper.length)];
    generatedPass += lower[Math.floor(Math.random() * lower.length)];
    for (let i = 2; i < 12; i++) {
      generatedPass += all[Math.floor(Math.random() * all.length)];
    }

    // 6-digit challenge code
    const challengeCode = Math.floor(100000 + Math.random() * 900000).toString();

    return NextResponse.json({
      success: true,
      user: {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        phone: matched.phone,
      },
      channel: isEmail ? "email" : "sms",
      destination: isEmail ? matched.email : matched.phone,
      challengeCode,
      generatedPassword: generatedPass,
      notice:
        "Strict Rule: Allowed only 1 request per calendar day. Generated password strictly contains letters only [A-Za-z].",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
