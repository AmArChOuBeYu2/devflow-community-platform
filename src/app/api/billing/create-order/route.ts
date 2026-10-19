import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = {
  bronze: 99,
  silver: 299,
  gold: 999,
};

export async function POST(request: NextRequest) {
  try {
    const { tier, userId } = await request.json();
    const amountRupees = PLAN_PRICES[String(tier)];
    if (!amountRupees) {
      return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({
        error: "Live Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel project environment variables.",
        code: "PAYMENTS_NOT_CONFIGURED",
      }, { status: 503 });
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountRupees * 100,
        currency: "INR",
        receipt: "devflow_" + Date.now(),
        notes: { tier: String(tier), userId: String(userId || "demo") },
      }),
      cache: "no-store",
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: "Razorpay could not create the order.", details: payload?.error?.description }, { status: 502 });
    }

    return NextResponse.json({
      orderId: payload.id,
      amount: payload.amount,
      currency: payload.currency,
      keyId,
      tier,
    });
  } catch {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }
}
