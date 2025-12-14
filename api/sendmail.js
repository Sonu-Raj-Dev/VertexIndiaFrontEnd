module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const nodemailer = require('nodemailer');
        const { first_name, last_name, email, phone, product_interest, message } = req.body;

        if (!first_name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.COMPANY_EMAIL || process.env.GMAIL_USER,
            subject: `New Inquiry from ${first_name} ${last_name}`,
            html: `<h2>New Product Inquiry</h2><p><b>Name:</b> ${first_name} ${last_name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><b>Product:</b> ${product_interest}</p><p><b>Message:</b></p><p>${message}</p>`,
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'We received your inquiry - Vertex India',
            html: `<h2>Thank You</h2><p>Dear ${first_name},</p><p>Thank you for contacting us. We will get back to you within 24-48 hours.</p><p>Best regards,<br>Vertex India Team</p>`,
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
};
