import { NextRequest, NextResponse } from "next/server";
import { hasPermission, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";
import Discord from "@/utils/apis/discord";
import { LogChannels } from "@/utils/apis/db";

const prisma = new PrismaClient()
const discord = new Discord()

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) {
        return new NextResponse(null, { status: 401 })
    }

    if (!await hasPermission(session.user.providerId, Permissions.VIEW_POLICIES)) {
        return new NextResponse(null, { status: 403 })
    }

    const policies = await prisma.policies.findMany({
        select: {
            id: true,
            name: true
        }
    })

    return new NextResponse(JSON.stringify(policies))
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) {
        return new NextResponse(null, { status: 401 })
    }

    if (!await hasPermission(session.user.providerId, Permissions.MANAGE_POLICIES)) {
        return new NextResponse(null, { status: 403 })
    }

    const body = await req.json()

    if (!body.name || !body.text) {
        return new NextResponse(null, { status: 400 })
    }

    await prisma.policies.create({
        data: {
            name: body.name,
            text: body.text
        }
    })

    await discord.sendLog(LogChannels.POLICY_CHANGED, {
        author: {
            name: session.user.displayName,
            icon_url: session.user.image
        },
        title: "Policy Created",
        description: `**Name:** ${body.name}\n`,
    })

    return new NextResponse(null, { status: 201 })
}