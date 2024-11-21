import { PrismaClient } from "@prisma/client"
import Caching from "./cache"
import log from "./log"

enum Permissions {
    ADMINISTRATOR = "ADMINISTRATOR",

    VIEW_STAFF = "VIEW.STAFF",
    VIEW_PRESENTERS = "VIEW.PRESENTERS",
    VIEW_MENTORS = "VIEW.MENTORS",
    VIEW_MANAGERS = "VIEW.MANAGERS",
    VIEW_DIRECTORS = "VIEW.DIRECTORS",
    
    VIEW_STATS = "VIEW.STATS",

    VIEW_POLICIES = "VIEW.POLICIES",
    EDIT_POLICIES = "EDIT.POLICIES",

    VIEW_RESOURCES = "VIEW.RESOURCES",
    EDIT_RESOURCES = "EDIT.RESOURCES",
    DELETE_RESOURCES = "DELETE.RESOURCES",
    CREATE_RESOURCES = "CREATE.RESOURCES",

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
    EDIT_CONNECTIONS = "EDIT.CONNECTIONS",
    DELETE_CONNECTIONS = "DELETE.CONNECTIONS",
    DELETE_MASS_CONNECTIONS = "DELETE.MASS.CONNECTIONS",

    CONTROLS_BACKEND_START = "CONTROLS.BACKEND.START",
    CONTROLS_BACKEND_STOP = "CONTROLS.BACKEND.STOP",
    CONTROLS_BACKEND_RESTART = "CONTROLS.BACKEND.RESTART",
    CONTROLS_BACKEND_SKIP = "CONTROLS.BACKEND.SKIP",
    CONTROLS_BACKEND_DISCONNECT = "CONTROLS.BACKEND.DISCONNECT",

    VIEW_PERMISSIONS = "VIEW.PERMISSIONS",
    EDIT_PERMISSIONS = "EDIT.PERMISSIONS",
    CREATE_PERMISSIONS = "CREATE.PERMISSIONS",
    DELETE_PERMISSIONS = "DELETE.PERMISSIONS",
}
type PagePermissions = Permissions

const prisma = new PrismaClient()
const roleCache = new Caching()
const permCache = new Caching()
const Log = new log('Permissions')

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

        roleCache.set(userid, data.roles, 3600)
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

async function hasPermission(userId: string, permission: string): Promise<boolean> {
    if (userId === process.env.ADMIN_ID) return true
    if (permission === undefined) return false

    try {
        const roles = await getUserRoles(userId)
        const perms: string[] = await getRolePerms(roles)

        const res = perms.map(perm => {
            if (perm === permission) return true
            if (perm === Permissions.ADMINISTRATOR) return true
        })

        Log.info(`User ${userId} has permission ${permission} - ${res.includes(true)}`)
        Log.debug(`Roles: ${roles}`, true)
        Log.debug(`Perms: ${perms}`, true)
        Log.debug(`Res: ${res}`, true)

        if (res.includes(true)) return true
    } catch (e) {
        console.log('Error: ', e)
    }

    return false
}

export { hasPermission, Permissions }
export type { PagePermissions }