import { dbAdapter } from "..";

async function ElevateUser(email: string, privilege: number = 0) {
    const result = await dbAdapter?.update({email: email}, {privilege: privilege});
    return {
        status: result
    };
}

export default ElevateUser;