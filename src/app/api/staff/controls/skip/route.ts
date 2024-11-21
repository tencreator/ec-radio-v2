import { NextRequest, NextResponse } from "next/server";
import { Azuracast } from "@/utils/apis/azuracast";
import { hasPermission, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";


export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) {
        return new NextResponse(null, { status: 401 })
    }

    if (!await hasPermission(session.user.providerId, Permissions.CONTROLS_BACKEND_SKIP)) {
        return new NextResponse(null, { status: 403 })
    }

    const success = await Azuracast.skipSong()

    return new NextResponse(JSON.stringify({ success }), {
        status: success ? 200 : 500
    })
}