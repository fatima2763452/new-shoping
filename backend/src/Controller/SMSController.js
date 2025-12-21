const twilio = require('twilio');
require('dotenv').config();

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_TO_PHONE_NUMBER;

// Twilio client
const client = twilio(accountSid, authToken);

// Controller function
exports.SMSController = async (req, res) => {
    const { phoneNumber, message } = req.body;

    console.log("Received phone number:", phoneNumber);
    console.log("Received message:", message);

    if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, error: "Phone number and message are required." });
    }

    try {
        const msg = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`, // Auto-add +91 if not included
        });

        console.log("SMS sent:", msg.sid);
        res.status(200).json({ success: true, sid: msg.sid });
    } catch (error) {
        console.error("Error sending SMS:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
