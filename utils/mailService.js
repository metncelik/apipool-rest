import nodemailer from 'nodemailer';
import { mailTransporterConfig } from '../config.js';

const transporter = nodemailer.createTransport(mailTransporterConfig);

async function sendEmail(to, subject, content) {
    const mailOptions = {
        from: 'API POOL',
        to,
        subject,
        text: content.text,
        html: content.html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
}

export {
    sendEmail
};