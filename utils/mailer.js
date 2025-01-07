import nodemailer from 'nodemailer';
import dotenv from 'dotenv';  // Import dotenv
dotenv.config(); // Load environment variables

// Create a transporter object using the Gmail SMTP server
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL (port 465)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Function to send the email notification
const sendNotification = async () => {
    try {
        const info = await transporter.sendMail({
            from: `"Crypto Repair Site" <${process.env.EMAIL_USER}>`,  // Sender address
            to: 'femiballer039@gmail.com',  // Admin's email address (replace with the actual admin email)
            subject: 'Form Submission Notification',  // Subject of the email
            text: 'A user just submitted a form on ur crptorepair website',  // Email body content
        });

        console.log(`Email sent: ${info.messageId}`);
        return true; // Return true if email sent successfully
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        return false; // Return false if there was an error
    }
};

export default sendNotification; // Export the function as a default export
