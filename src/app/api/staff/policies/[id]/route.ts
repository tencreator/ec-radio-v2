import { NextRequest, NextResponse } from "next/server";
import { hasPermission, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";
import Caching from "@/utils/cache";

const prisma = new PrismaClient()
const cache = new Caching() 

export async function GET(req: NextRequest, { params }: { params: Promise<{id: string}>}): Promise<NextResponse> {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) {
        return new NextResponse(null, { status: 401 })
    }

    if (!await hasPermission(session.user.providerId, Permissions.VIEW_POLICIES)) {
        return new NextResponse(null, { status: 403 })
    }

    const { id } = await params
    
    if (id) {
        if (cache.has(id)) {
            return new NextResponse(cache.get(id))
        }

        const policy = await prisma.policies.findFirst({
            where: {
                id: parseInt(id)
            }
        })

        if (!policy) {
            cache.set(id, JSON.stringify(policy), 300)
            return new NextResponse(null, { status: 404 })
        }

        cache.set(id, JSON.stringify(policy), 300)

        return new NextResponse(JSON.stringify(policy))
    } else {
        if (cache.has('all')) {
            return new NextResponse(cache.get('all'))
        }

        const policies = await prisma.policies.findMany()

        cache.set('all', JSON.stringify(policies), 300)

        return new NextResponse(JSON.stringify(policies))
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{id: string}>}): Promise<NextResponse> {
    try {
        const session = await auth()
    
        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorised", { status: 401 })
        }
    
        if (!await hasPermission(session.user.providerId, Permissions.MANAGE_POLICIES)) {
            return new NextResponse("Forbidden", { status: 403 })
        }
    
        const { id } = await params
        const body = await req.json()
    
        if (!id) {
            return new NextResponse("Bad Request", { status: 400 })
        }
    
        const policy = await prisma.policies.update({
            where: {
                id: parseInt(id)
            },
            data: {
                text: body.text,
                name: body.name
            }
        })
    
        cache.set(id, JSON.stringify(policy), 300)
    
        return new NextResponse(JSON.stringify(policy))
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{id: string}>}): Promise<NextResponse> {
    try {
        const session = await auth()
    
        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorised", { status: 401 })
        }
    
        if (!await hasPermission(session.user.providerId, Permissions.MANAGE_POLICIES)) {
            return new NextResponse("Forbidden", { status: 403 })
        }
    
        const { id } = await params
    
        if (!id) {
            return new NextResponse("Bad Request", { status: 400 })
        }
    
        const policy = await prisma.policies.delete({
            where: {
                id: parseInt(id)
            }
        })
    
        cache.delete(id)
    
        return new NextResponse(JSON.stringify(policy))
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}