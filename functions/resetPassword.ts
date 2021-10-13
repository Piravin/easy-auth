import { config, dbAdapter } from "..";
import Emailer from "../utils/utils";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

async function RequestReset(email: string, testing: boolean = false) {
    const userId = await dbAdapter?.checkExists({email: email});
    if (userId === null) {
        return {
            status: false,
            message: "User doesn't exist"
        };
    }

    const token = await jwt.sign(userId!, config!.JWT_SECRET!);

    if (!testing) {
        const mailDirector = new Emailer();

        const htmlContent = await mailDirector.readFromTemplate("password-reset.ejs", {
            link: `${config!.SERVER_NAME}/auth/reset?id=${userId}&code=${token}`
        }).then(data=>{
            return data;
        }).catch(err=>console.error(err));

        const mailResponse = await mailDirector.sendMail({
            from: config?.EMAIL_ID!,
            to: email,
            subject: "Password reset",
            text: "",
            html: htmlContent || ""
        });

        if (mailResponse !== null) {
            return {
                status: true,
                message: "Link to reset password has been sent successfully"
            }
        } else {
            return {
                status: false,
                message: "Something went wrong"
            }
        }
    }

    return {
        status: true,
        resetToken: token
    };

}

async function ValidateReset(token:string, password: string) {
    const userId = await jwt.verify(token, config!.JWT_SECRET);
    if (!userId) {
        return {
            status: false,
            message: "User doesn't exist"
        };
    }

    const hash = await bcrypt.hash(password!, Number(config!.BCRYPT_SALT));
    const result = await dbAdapter?.update({_id: userId}, {password: hash});
    if (result) {
        return {
            status: true,
            message: "Password reset successfully"
        };
    } else {
        return {
            status: false,
            message: "Something went wrong"
        };
    }
}

export {RequestReset, ValidateReset};