import jwt, { JwtPayload } from "jsonwebtoken";
import {config, dbAdapter} from "../index";

async function CheckAuth(token: string, privilege: number = 0) {

    /**
     * This function is used to verify JWT
     * to perform authorization of user at various stages
     */
    try {

        // jwt throws an error if the token is not genuine
        const result = await jwt.verify(token, config!.JWT_SECRET!);

        let info: JwtPayload = typeof(result) == "string" ? {} : result;
        
        const userInfo = await dbAdapter?.getValues({_id: info.userId},["name", "email", "privilege"]);
               
        if (userInfo === null) throw new Error("User not found");
        if (Number(userInfo.privilege) < privilege) throw new Error("Unauthorized user");

        return {
            status: true,
            data: {
                userName: userInfo?.name,
                userEmail: userInfo?.email
            },
            message: "User is verified"
        }

    } catch (err) {

        return {
            status: false,
            message: err
        }

    }
}

export default CheckAuth;