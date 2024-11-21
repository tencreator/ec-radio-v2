import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hasPermission, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth";
import Caching from "@/utils/cache";

const prisma = new PrismaClient();
const cache = new Caching()

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        if (cache.has('status')) {
            return NextResponse.json({ acceptingRequests: cache.get('status') });
        }

        const data = await prisma.siteSettings.findFirst({
            where: {
                id: 1
            },
            select: {
                reqOpen: true
            }
        })

        cache.set('status', data?.reqOpen || false, 300)

        return NextResponse.json({ acceptingRequests: data?.reqOpen || false });
    } catch {
        return NextResponse.json({ acceptingRequests: false }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        if (!await hasPermission(session.user.providerId, Permissions.TOGGLE_REQUESTS)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const currentSettings = await prisma.siteSettings.findFirst({
            where: {
                id: 1
            },
            select: {
                reqOpen: true
            }
        })

        await prisma.siteSettings.update({
            where: {
                id: 1
            },
            data: {
                reqOpen: !currentSettings?.reqOpen || false
            }
        })

        cache.delete('status')

        return NextResponse.json({ acceptingRequests: !currentSettings?.reqOpen || false });
    } catch {
        return NextResponse.json({ acceptingRequests: false }, { status: 500 });
    }
}