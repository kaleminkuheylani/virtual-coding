import { NextRequest, NextResponse } from "next/server";

const VERIFY_ENDPOINTS = {
  github: "https://api.github.com/user",
  vercel: "https://api.vercel.com/v2/user",
  netlify: "https://api.netlify.com/api/v1/user",
} as const;

type Provider = keyof typeof VERIFY_ENDPOINTS;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { provider?: Provider; token?: string };

  if (!body.provider || !(body.provider in VERIFY_ENDPOINTS)) {
    return NextResponse.json({ ok: false, error: "Invalid provider." }, { status: 400 });
  }

  if (!body.token?.trim()) {
    return NextResponse.json({ ok: false, error: "Token is required." }, { status: 400 });
  }

  const verifyUrl = VERIFY_ENDPOINTS[body.provider];
  const response = await fetch(verifyUrl, {
    headers: {
      Authorization: `Bearer ${body.token.trim()}`,
      "User-Agent": "virtual-coding-ide",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: "Token verification failed." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
