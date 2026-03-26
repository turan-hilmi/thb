import { NextResponse } from "next/server";
import { ILLER, NITELIKLER } from "@/lib/locations";

export async function GET() {
  return NextResponse.json({ iller: ILLER, nitelikler: NITELIKLER });
}
