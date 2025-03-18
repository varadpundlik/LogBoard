require('dotenv').config();
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

exports.sendMail = (req, res) => {
  const { type, email, name, _id, cpuUsage, errorMessage } = req.body;

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.PASS
    }
  });

  // Create Mailgen instance for generating email templates
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'System Alert',
      link: 'https://dashboard.example.com'
    }
  });

  let emailBody;
  let subject;

  // Check the type of alert (CPU Usage or Error Message)
  if (type === "cpu") {
    subject = `🚨 High CPU Usage Alert - ${cpuUsage}%`;
    emailBody = mailGenerator.generate({
      body: {
        name: name || "Admin",
        intro: `⚠️ High CPU Usage detected: ${cpuUsage}%`,
        action: {
          instructions: "Please investigate and take necessary action.",
          button: {
            color: "#FF0000",
            text: "View System Status",
            link: `https://dashboard.example.com/system-status`
          }
        },
        outro: "This is an automated alert. Please do not reply."
      }
    });
  } else if (type === "error") {
    subject = `❌ Error Detected in System Logs`;
    emailBody = mailGenerator.generate({
      body: {
        name: name || "Admin",
        intro: `🚨 An error was detected in the system logs:`,
        dictionary: [
          { "Error Message": errorMessage }
        ],
        action: {
          instructions: "Check the logs for further details.",
          button: {
            color: "#FF5733",
            text: "View Logs",
            link: `https://dashboard.example.com/logs/${_id}`
          }
        },
        outro: "Immediate action may be required."
      }
    });
  } else {
    return res.status(400).json({ error: "Invalid email type specified." });
  }

  // Define the email options
  const mailOptions = {
    from: process.env.MAIL_ID,
    to: email,
    subject: subject,
    html: emailBody
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ message: 'Email sent successfully', response: info.response });
  });
};
