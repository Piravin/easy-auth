import bcrypt from "bcrypt";
import { dbAdapter } from "..";

async function VerifyUser(id:string, code: string) {
    
    /**
     * Handle user verification after the user clicks the 
     * link sent through email
     */

    const match = await bcrypt.compare(id, code);
    if (match) {
        const userId = await dbAdapter?.checkExists({_id: id});
        
        if (userId == null || userId == undefined) return false;

        const result = await dbAdapter?.update({
            _id: userId
        }, {verified: true});
        return result;
        
    } else return false;
}

export default VerifyUser;