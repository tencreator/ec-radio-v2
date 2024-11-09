enum Permissions {
    ADMINISTRATOR = "ADMINISTRATOR",

    VIEW_STAFF = "VIEW.STAFF",
    VIEW_PRESENTERS = "VIEW.PRESENTERS",
    VIEW_MANAGERS = "VIEW.MANAGERS",
    VIEW_DIRECTORS = "VIEW.DIRECTORS",

    VIEW_POLICIES = "VIEW.POLICIES",
    EDIT_POLICIES = "EDIT.POLICIES",

    VIEW_STATS = "VIEW.STATS",

    VIEW_PERMISSIONS = "VIEW.PERMISSIONS",
    EDIT_PERMISSIONS = "EDIT.PERMISSIONS",
    CREATE_PERMISSIONS = "CREATE.PERMISSIONS",
    DELETE_PERMISSIONS = "DELETE.PERMISSIONS",
}

type PagePermissions = Permissions

async function hasPermission(session: any, permission: PagePermissions): Promise<boolean> {
    if (!session?.user?.perms) return false

    for (const perm of session.user.perms) {
        if (perm.toUpperCase() === ("ADMINISTRATOR").toUpperCase()) return true
        if (perm.toUpperCase() === permission.toUpperCase()) return true
    }

    return false
}

function hasPermissionSync(session: any, permission: PagePermissions): boolean {
    console.log(session.user.perms)
    
    if (!session?.user?.perms) return false

    for (const perm of session.user.perms) {
        if (perm.toUpperCase() === ("ADMINISTRATOR").toUpperCase()) return true
        if (perm.toUpperCase() === permission.toUpperCase()) return true
        const permParts = perm.toUpperCase().split('.')
        const permissionParts = permission.toUpperCase().split('.')
        if (permParts.length === permissionParts.length && permParts[0] === permissionParts[0] && (permParts[1] === '*' || permParts[1] === 'global')) return true
    }

    return false
}

export { hasPermission, hasPermissionSync, Permissions }
export type { PagePermissions }