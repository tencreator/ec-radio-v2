import { PrismaClient } from "@prisma/client"
import Caching from "@/utils/cache"
import { Permissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

const prisma = new PrismaClient()
const roleCache = new Caching()
const permCache = new Caching()

async function getUserRoles(userid: string): Promise<string[]> {
    try {
        if (roleCache.has(userid)) {
            return roleCache.get(userid)
        }

        const url = `https://discord.com/api/v9/guilds/${process.env.GUILD_ID}/members/${userid}`

        const res = await fetch(url, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message)
        }

        roleCache.set(userid, data.roles, 60)
        return data.roles
    } catch {
        return []
    }
}

async function getRolePerms(roles: string[]): Promise<string[]> {
    if (roles.length === 0) return []
    const pernsArray = []

    for (const role of roles) {
        if (permCache.has(role)) {
            pernsArray.push(permCache.get(role))
            continue
        }

        try {
            const perms = await prisma.permissions.findMany({
                where: {
                    roleid: role
                },
                select: {
                    permissions: true
                }
            })

            const permsArr = perms.map(perm => perm.permissions.split(','))
            pernsArray.push(permsArr)
            permCache.set(role, permsArr, 3600)
        } catch {
            pernsArray.push([])
        }
    }

    return pernsArray.flat().flat()
}

async function hasPermission(userId: string, permission: Permissions): Promise<boolean> {
    if (userId === process.env.ADMIN_ID) return true

    try {
        const roles = await getUserRoles(userId)
        const perms: string[] = await getRolePerms(roles)

        const res = perms.map(perm => {
            if (perm === permission) return true
            if (perm === Permissions.ADMINISTRATOR) return true
        })

        if (res) return true
        return false
    } catch (e) {
        console.log('Error: ', e)
        return false
    }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const perm = req.nextUrl.searchParams.get('perm')
    if (!perm) {
        return new NextResponse('Bad Request', { status: 400 })
    }

    const hasPerm = await hasPermission(session.user.providerId, perm as Permissions)

    return new NextResponse(JSON.stringify({ hasPerm }))
}