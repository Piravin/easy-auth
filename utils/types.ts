export interface MailInfo {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}