const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { first_name, last_name, email, phone, product_interest, message } = req.body;

        // Validate required fields
        if (!first_name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Create transporter using environment variables
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // Email to company
        const companyMailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.COMPANY_EMAIL || process.env.GMAIL_USER,
            subject: `New Inquiry from ${first_name} ${last_name}`,
            html: `
                <h2>New Product Inquiry</h2>
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Product Interest:</strong> ${product_interest || 'Not specified'}</p>
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        // Confirmation email to user
        const userMailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'We received your inquiry - Vertex India Compressors',
            html: `
                <h2>Thank You for Your Inquiry</h2>
                <p>Dear ${first_name},</p>
                <p>Thank you for contacting Vertex India Compressors. We have received your inquiry and will get back to you soon.</p>
                <h3>Your Inquiry Details:</h3>
                <p><strong>Product Interest:</strong> ${product_interest || 'General inquiry'}</p>
                <p><strong>Your Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <p>Our team will contact you within 24-48 hours.</p>
                <p>Best regards,<br>Vertex India Compressors Team</p>
            `,
        };

        // Send emails
        await transporter.sendMail(companyMailOptions);
        await transporter.sendMail(userMailOptions);

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
        });
    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message,
        });
    }
};
