import { NextRequest, NextResponse } from "next/server";
import { hasPermissionSync, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!hasPermissionSync(session, Permissions.VIEW_POLICIES)) {
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

    if (!hasPermissionSync(session, Permissions.EDIT_POLICIES)) {
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