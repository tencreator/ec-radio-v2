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

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    
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