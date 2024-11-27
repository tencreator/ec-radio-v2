import { NextRequest, NextResponse } from "next/server";
import { hasPermission, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

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

    return new NextResponse(null, { status: 201 })
}