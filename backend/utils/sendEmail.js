import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    console.log("--- Sending Email ---");
    console.log("To:", options.email);
    console.log("Host:", process.env.SMTP_HOST);
    console.log("User:", process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log("Email sent successfully!");
        console.log("Message ID:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed!");
        console.error(error);
        throw error;
    }
};

export default sendEmail;
