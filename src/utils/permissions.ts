enum Permissions {
    ADMINISTRATOR = "ADMINISTRATOR",

    VIEW_STAFF = "VIEW.STAFF",
    VIEW_PRESENTERS = "VIEW.PRESENTERS",
    VIEW_MANAGERS = "VIEW.MANAGERS",
    VIEW_DIRECTORS = "VIEW.DIRECTORS",

    VIEW_POLICIES = "VIEW.POLICIES",
    EDIT_POLICIES = "EDIT.POLICIES",

    VIEW_STATS = "VIEW.STATS",

    VIEW_REQUESTS = "VIEW.REQUESTS",
    ACCEPT_REQUESTS = "ACCEPT.REQUESTS",
    MANAGE_REQUESTS = "MANAGE.REQUESTS",
    TOGGLE_REQUESTS = "TOGGLE.REQUESTS",

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

async function hasPermission(session: any, permission: PagePermissions): Promise<boolean> {
    try {
        if (!session?.user?.perms) return false

        for (const perm of session.user.perms) {
            if (perm.toUpperCase() === ("ADMINISTRATOR").toUpperCase()) return true
            if (perm.toUpperCase() === permission.toUpperCase()) return true
            const permParts = perm.toUpperCase().split('.')
            const permissionParts = permission.toUpperCase().split('.')
            if (permParts.length === permissionParts.length && permParts[0] === permissionParts[0] && (permParts[1] === '*' || permParts[1] === 'global')) return true
        }

        
        return false
    } catch {
        return false
    }
}

function hasPermissionSync(session: any, permission: PagePermissions): boolean {
    try {
        if (!session?.user?.perms) return false

        for (const perm of session.user.perms) {
            if (perm.toUpperCase() === ("ADMINISTRATOR").toUpperCase()) return true
            if (perm.toUpperCase() === permission.toUpperCase()) return true
            const permParts = perm.toUpperCase().split('.')
            const permissionParts = permission.toUpperCase().split('.')
            if (permParts.length === permissionParts.length && permParts[0] === permissionParts[0] && (permParts[1] === '*' || permParts[1] === 'global')) return true
        }

        return false
    } catch {
        return false
    }
}

export { hasPermission, hasPermissionSync, Permissions }
export type { PagePermissions }