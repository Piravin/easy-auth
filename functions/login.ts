import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {config, dbAdapter} from "../index";

async function LoginUser(email: string, password: string) {

    /**
     * Handle user authentication
     * and set JWT for further authorization
     */

    const user = await dbAdapter?.getValues({ email: email }, ["password", "verified"]);
    
    // Check whether user exists and is verified
    if (user !== null && user.verified) {

        // Compare password hashes with the one stored in database
        const authenticated = await bcrypt.compare(password, user.password);

        // Set the JWT token as a cookie if authenticated
        if (authenticated) {

            const token = await jwt.sign(user._id, config!.JWT_SECRET!);

            return {
                status: true,
                data: {
                    token: token
                },
                message: "Login successful."
            };
        }
    }

    /* Return unauthorized if 
        - user has not verified email
        - email and password don't match
        - user does not exist
    */
    return {
        status: false,
        message: "Login Falied"
    };

}

export default LoginUser;