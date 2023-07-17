import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

//We created this secret
const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret, raw: true });

  return NextResponse.json({ token }, { status: 200 });
}
