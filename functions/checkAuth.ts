import jwt from "jsonwebtoken";
import {config, dbAdapter} from "../index";

async function CheckAuth(token: string) {

    /**
     * This function is used to verify JWT
     * to perform authorization of user at various stages
     */
    try {

        // jwt throws an error if the token is not genuine
        const result = await jwt.verify(token, config!.JWT_SECRET!);

        const userInfo = await dbAdapter?.getValues({_id: result},["name", "email"]);
               
        if (userInfo === null) throw new Error("User not found");

        return {
            status: true,
            data: {
                userName: userInfo?.name,
                userEmail: userInfo?.email
            },
            message: "User is verified"
        }

    } catch (err) {

        console.log(err);
        return {
            status: false,
            message: "User not verified"
        }

    }
}

export default CheckAuth;