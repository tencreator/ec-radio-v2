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