import bcrypt from "bcrypt";
import { config, dbAdapter } from "../index";
import Emailer from "../utils/utils";

async function SignUp(name: string, email: string, password: string, testing: boolean = false, privilege: number = 0) {

    // Check if user allready exists
    const exists = await dbAdapter?.checkExists({email: email});
    if (exists !== null) {
        return {
            status: false,
            message: "User allready exists"
        }
    }

    // Create record/document for the user and mark as unverified
    let hash = await bcrypt.hash(password, Number(config!.BCRYPT_SALT));
    const userId = await dbAdapter?.insert({name: name, email: email, password: hash, verified: false, privilege: privilege});
    hash = await bcrypt.hash(userId, Number(config!.BCRYPT_SALT));

    if (!testing) {
        // Send email for verification
        const mailDirector = new Emailer();

        // Write email using ejs template
        const htmlContent = await mailDirector.readFromTemplate("email.ejs", {
            link: `${config!.SERVER_NAME}/auth/verify?id=${userId}&code=${hash}`
        }).then(data=>{
            return data;
        }).catch(err=>console.error(err));

        const mailResponse = await mailDirector.sendMail({
            from: config?.EMAIL_ID!,
            to: email,
            subject: "Account verification",
            text: "",
            html: htmlContent || ""
        });
        // Finidhed handling email verification
        
        if (mailResponse !== null) {
            return {
                status: true,
                message: "User added successfully. Please verify using the mail sent to your registered"
            }
        } else {
            return {
                status: false,
                message: "Something went wrong"
            }
        }
    } else {
        return {
            link: `${config!.SERVER_NAME}/auth/verify?id=${userId}&code=${hash}`,
            userId : userId,
            code : hash
        }
    }
}

export default SignUp;