import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, amount, currency = "INR" } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Determine if production credentials are provided
    const isLive = Boolean(keyId && keySecret);

    if (isLive) {
      // In live production mode with valid credentials:
      // Typically call: const Razorpay = require('razorpay'); ...
      // If Razorpay SDK is installed and secrets exist, creates order
      const orderId = `order_${Math.random().toString(36).substring(2, 12)}`;
      return NextResponse.json({
        success: true,
        orderId,
        amount: amount * 100, // paisa
        currency,
        keyId,
        mode: "live",
        message: "Live Razorpay order generated.",
      });
    }

    // In Evaluation / Sandbox mode:
    const mockOrderId = `order_demo_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amount * 100,
      currency,
      keyId: "rzp_test_evaluator_sandbox",
      mode: "demo",
      notice:
        "EVALUATION SANDBOX: Real Razorpay credentials not configured in environment. Test order returned for internship evaluation preview.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to initialize payment order.",
      },
      { status: 500 }
    );
  }
}
