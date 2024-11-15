import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { Permissions, hasPermissionSync } from "@/utils/permissions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const resources = await prisma.resources.findMany({})

        return new NextResponse(JSON.stringify(resources), {
            headers: {
                "content-type": "application/json",
            },
        });
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}