import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailInfo } from "./types";

import path from "path";
import ejs from "ejs";

class Emailer {

    /**
     * This class handles the emails to be set for user verification
     */

    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

    constructor() {

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_TOKEN
            },
        });
    }

    async sendMail(content: MailInfo) {
        let info = await this.transporter.sendMail({...content});
        return info;
    }

    async readFromTemplate(template: string, content: any) {
        const template_path = path.join(__dirname, template);
        console.log(template_path);
        let htmlContent!: string;
        await ejs.renderFile(template_path, {...content}, (err, data) => {
            if (err) {
                console.error(err);
                throw new Error(err.message);
            } else {
                htmlContent = data
                return data;
            }
        });
        return htmlContent;
    }
}

export default Emailer;