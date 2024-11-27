import { PrismaClient } from "@prisma/client"
import Caching from "./cache"

enum Permissions {
    ADMINISTRATOR = "ADMINISTRATOR",

    VIEW_STAFF = "VIEW.STAFF",
    VIEW_PRESENTERS = "VIEW.PRESENTERS",
    VIEW_MENTORS = "VIEW.MENTORS",
    VIEW_MANAGERS = "VIEW.MANAGERS",
    VIEW_DIRECTORS = "VIEW.DIRECTORS",
    
    VIEW_STATS = "VIEW.STATS",

    VIEW_POLICIES = "VIEW.POLICIES",
    MANAGE_POLICIES = "MANAGE.POLICIES",

    VIEW_RESOURCES = "VIEW.RESOURCES",
    MANAGE_RESOURCES = "MANAGE.RESOURCES",

    VIEW_REQUESTS = "VIEW.REQUESTS",
    ACCEPT_REQUESTS = "ACCEPT.REQUESTS",
    MANAGE_REQUESTS = "MANAGE.REQUESTS",
    TOGGLE_REQUESTS = "TOGGLE.REQUESTS",

    BAN_IP = "BAN.IP",
    UNBAN_IP = "UNBAN.IP",

    VIEW_TIMETABLE = "VIEW.TIMETABLE",
    SELF_TIMETABLE = "SELF.TIMETABLE",
    OTHERS_TIMETABLE = "OTHERS.TIMETABLE",

    SELF_CONNECTION = "SELF.CONNECTION",
    VIEW_CONNECTIONS = "VIEW.CONNECTIONS",
    MANAGE_CONNECTIONS = "MANAGE.CONNECTIONS",

    CONTROLS_BACKEND_START = "CONTROLS.BACKEND.START",
    CONTROLS_BACKEND_STOP = "CONTROLS.BACKEND.STOP",
    CONTROLS_BACKEND_RESTART = "CONTROLS.BACKEND.RESTART",
    CONTROLS_BACKEND_SKIP = "CONTROLS.BACKEND.SKIP",
    CONTROLS_BACKEND_DISCONNECT = "CONTROLS.BACKEND.DISCONNECT",

    VIEW_PERMISSIONS = "VIEW.PERMISSIONS",
    EDIT_PERMISSIONS = "EDIT.PERMISSIONS",
    CREATE_PERMISSIONS = "CREATE.PERMISSIONS",
    DELETE_PERMISSIONS = "DELETE.PERMISSIONS",

    VIEW_SETTINGS = "VIEW.SETTINGS",
    EDIT_SETTINGS = "EDIT.SETTINGS",
}

type PagePermissions = Permissions

const prisma = new PrismaClient()
const roleCache = new Caching()
const permCache = new Caching()

async function getUserRoles(userid: string): Promise<string[]> {
    if (roleCache.has(userid)) {
        return roleCache.get(userid)
    }

    try {
        const url = `https://discord.com/api/v9/guilds/${process.env.GUILD_ID}/members/${userid}`

        const res = await fetch(url, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch user roles')
        }

        const data = await res.json()

        roleCache.set(userid, data.roles, 10 * 60)
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

            if (perms.length === 0) continue

            const permsArr = perms.map(perm => perm.permissions.split(','))
            pernsArray.push(permsArr)
            permCache.set(role, permsArr, 3600)
        } catch {
            pernsArray.push([])
        }
    }

    return pernsArray.flat().flat()
}

async function hasPermission(userId: string | undefined, permission: string): Promise<boolean> {
    if (!userId) return false
    if (userId === process.env.ADMIN_ID) return true
    if (permission === undefined) return false

    try {
        const roles = await getUserRoles(userId)
        const perms: string[] = await getRolePerms(roles)

        const res = perms.map(perm => {
            if (perm === permission) return true
            if (perm === Permissions.ADMINISTRATOR) return true
        })

        if (res.includes(true)) return true
    } catch (e) {
        console.log('Error: ', e)
    }

    return false
}

export { hasPermission, Permissions }
export type { PagePermissions }