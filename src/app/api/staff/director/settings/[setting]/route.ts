import { NextRequest, NextResponse } from "next/server";
import { hasPermission, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
const putActions: {[key: string]: (req: NextRequest)=> Promise<NextResponse> } = {
    webhookChannels
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{setting: string}>}): Promise<NextResponse> {
    try {
        const session = await auth()
    
        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorised", { status: 401 })
        }

        const { setting } = await params
        if (!setting || !putActions[setting]) {
            return new NextResponse("Bad Request", { status: 404 })
        }

        return putActions[setting](req)
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

async function webhookChannels(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!await hasPermission(session?.user?.providerId, Permissions.EDIT_SETTINGS)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()

        if (!body.songchanged || !body.listenerStats || !body.djConnected || !body.djDisconnected || !body.stationDown || !body.stationUp) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        await prisma.webhookChannels.updateMany({
            data: {
                songchanged: body.songchanged,
                listenerStats: body.listenerStats,
                djConnected: body.djConnected,
                djDisconnected: body.djDisconnected,
                stationDown: body.stationDown,
                stationUp: body.stationUp
            }
        })

        return new NextResponse("OK", { status: 200 })
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}