import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hasPermissionSync, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth";

const prisma = new PrismaClient();
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const data = await prisma.siteSettings.findFirst({
            where: {
                id: 1
            },
            select: {
                reqOpen: true
            }
        })

        return NextResponse.json({ acceptingRequests: data?.reqOpen || false });
    } catch {
        return NextResponse.json({ acceptingRequests: false }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await auth();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        if (!hasPermissionSync(user, Permissions.TOGGLE_REQUESTS)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const currentSettings = await prisma.siteSettings.findFirst({
            where: {
                id: 1
            },
            select: {
                reqOpen: true
            }
        })

        prisma.siteSettings.update({
            where: {
                id: 1
            },
            data: {
                reqOpen: !currentSettings?.reqOpen || false
            }
        })

        return NextResponse.json({ acceptingRequests: !currentSettings?.reqOpen || false });
    } catch {
        return NextResponse.json({ acceptingRequests: false }, { status: 500 });
    }
}