import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/utils/auth"
import { Permissions, hasPermission } from "@/utils/permissions"
import Discord from "@/utils/apis/discord"

const prisma = new PrismaClient()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!await hasPermission(session.user.providerId, Permissions.OTHERS_TIMETABLE)) return new NextResponse("Unauthorized", { status: 401 })

        const filter = request.nextUrl.searchParams.get('filter') as string || ''
        const max = parseInt(request.nextUrl.searchParams.get('max') as string) || 10
        const offset = parseInt(request.nextUrl.searchParams.get('offset') as string) || 0

        const timetable = await prisma.timetablelogs.findMany({
            take: max,
            skip: offset,
            where: {
                action: {
                    contains: filter
                }
            }
        })

        const timetableWithUsers = await Promise.all(timetable.map(async (log) => {
            const user = await discord.getUserData(log.userid)

            if (user) {
                return {
                    id: log.id,
                    date: log.date,
                    time: log.time,
                    action: log.action,
                    user: {
                        id: log.userid,
                        name: user.displayName,
                        avatar: user.avatar,
                    },
                    processed_at: log.processedAt
                }
            } else {
                return {
                    id: log.id,
                    date: log.date,
                    time: log.time,
                    action: log.action,
                    user: {
                        id: log.userid,
                        name: "Unknown",
                        avatar: "",
                    },
                    processed_at: log.processedAt
                }
            }
        }))

        return new NextResponse(JSON.stringify({logs: timetableWithUsers}), { headers: { "content-type": "application/json" } })
    } catch (e: any) {
        return new NextResponse("Internal server error", { status: 500 })
    }
}