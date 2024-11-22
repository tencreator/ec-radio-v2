import { auth } from "@/utils/auth";
import Login from "@/components/auth/login";
import Signout from "@/components/auth/logout";

export default async function Page() {
    const session = await auth()
    
    if (session) {
        return <Signout />
    }
    
    return <Login redirect="/staff" />
}