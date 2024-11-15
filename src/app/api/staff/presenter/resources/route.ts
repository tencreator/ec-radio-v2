import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
    return new NextResponse('Not implemented', { status: 501 });
}