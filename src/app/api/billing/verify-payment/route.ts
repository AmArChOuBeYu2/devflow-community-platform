import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = {
  bronze: 99,
  silver: 299,
  gold: 999,
};

export async function POST(request: NextRequest) {
  try {
    const { tier, orderId, paymentId, signature } = await request.json();
    const amountRupees = PLAN_PRICES[String(tier)];
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!amountRupees || !orderId || !paymentId || !signature || !keyId || !keySecret) {
      return NextResponse.json({ error: "Missing or invalid payment verification details." }, { status: 400 });
    }

    const expected = createHmac("sha256", keySecret).update(String(orderId) + "|" + String(paymentId)).digest("hex");
    const actualBuffer = Buffer.from(String(signature), "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    // Confirm the payment belongs to this order and the exact plan amount before activating membership.
    const paymentResponse = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(String(paymentId)), {
      headers: {
        Authorization: "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64"),
      },
      cache: "no-store",
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok ||
        payment.order_id !== orderId ||
        payment.amount !== amountRupees * 100 ||
        payment.currency !== "INR" ||
        !["captured", "authorized"].includes(payment.status)) {
      return NextResponse.json({ error: "Payment does not match the selected plan or is not authorized." }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      paymentId: String(paymentId),
      paymentMethod: String(payment.method || "Razorpay"),
      status: String(payment.status),
    });
  } catch {
    return NextResponse.json({ error: "Could not verify payment." }, { status: 400 });
  }
}
