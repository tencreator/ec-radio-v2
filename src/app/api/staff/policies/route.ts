import { NextRequest, NextResponse } from "next/server";
import { hasPermissionSync, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";
import Caching from "@/utils/cache";

const prisma = new PrismaClient()
const cache = new Caching()

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!hasPermissionSync(session, Permissions.VIEW_POLICIES)) {
        return new NextResponse(null, { status: 403 })
    }

    if (cache.has('all')) {
        return new NextResponse(cache.get('all'))
    }

    const policies = await prisma.policies.findMany({
        select: {
            id: true,
            name: true
        }
    })

    cache.set('all', JSON.stringify(policies), 300)

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

    cache.delete('all')

    return new NextResponse(null, { status: 201 })
}