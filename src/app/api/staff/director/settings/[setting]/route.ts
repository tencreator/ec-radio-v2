import { NextRequest, NextResponse } from "next/server";
import { hasPermission, Permissions } from "@/utils/permissions";
import { auth } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";
import Discord from "@/utils/apis/discord";
import { LogChannels } from "@/utils/apis/db";

const prisma = new PrismaClient()
const discord = new Discord()
const putActions: {[key: string]: (req: NextRequest)=> Promise<NextResponse> } = {
    webhookChannels,
    liveRole
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{setting: string}>}): Promise<NextResponse> {
    try {
        const session = await auth()
    
        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorised", { status: 401 })
        }

        const { setting } = await params
        if (!setting || !putActions[setting]) {
            return new NextResponse("Bad Request", { status: 404 })
        }

        return putActions[setting](req)
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

async function webhookChannels(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!await hasPermission(session?.user?.providerId, Permissions.EDIT_SETTINGS)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()

        if (!body.songchanged || !body.listenerStats || !body.djConnected || !body.djDisconnected || !body.stationDown || !body.stationUp) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        const generateFields = (arr: {[key: string]: string}): {name: string, value: string}[] => {
            const fields: {name: string, value: string}[] = []

            for (const key in arr) {
                if (key === 'id') continue

                fields.push({
                    name: key,
                    value: `<#${arr[key]}>`
                })
            }

            return fields
        }

        await discord.sendLog(LogChannels.SETTINGS_CHANGED, {
            author: {
                name: session?.user?.displayName || "Unknown",
                icon_url: session?.user?.image || undefined
            },
            title: "Log Channels Updated",
            fields: generateFields(body)
        })

        await prisma.webhookChannels.updateMany({
            data: {
                ...body
            }
        })

        return new NextResponse("OK", { status: 200 })
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

async function liveRole(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!await hasPermission(session?.user?.providerId, Permissions.EDIT_SETTINGS)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()

        if (!body.staff || !body.dj || !body.listener || !body.banned) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        await discord.sendLog(LogChannels.SETTINGS_CHANGED, {
            author: {
                name: session?.user?.displayName || "Unknown",
                icon_url: session?.user?.image || undefined
            },
            title: "Live Updated",
            fields: [
                {
                    name: "Role",
                    value: `<@&${body.liveRole}>`
                }
            ]
        })

        await prisma.siteSettings.updateMany({
            data: {
                liveRole: body.liveRole
            }
        })

        return new NextResponse("OK", { status: 200 })
    } catch {
        return new NextResponse("Internal Error", { status: 500 })
    }
}