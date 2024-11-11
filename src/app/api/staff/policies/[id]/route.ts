import { NextRequest, NextResponse } from "next/server";
import { hasPermissionSync, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    console.log(session)
    if (!hasPermissionSync(session, Permissions.VIEW_POLICIES)) {
        return new NextResponse(null, { status: 403 })
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (id) {
        const policy = await prisma.policies.findFirst({
            where: {
                id: parseInt(id)
            }
        })

        if (!policy) {
            return new NextResponse(null, { status: 404 })
        }

        return new NextResponse(JSON.stringify(policy))
    } else {
        const policies = await prisma.policies.findMany()

        return new NextResponse(JSON.stringify(policies))
    }
}