/**
 * Enrollment Confirmation Email Template
 * @param {string} userName - The name of the user
 * @param {string} courseTitle - The title of the course
 * @param {string} courseLink - The link to start the course
 * @returns {string} - The HTML content
 */
export const getEnrollmentEmailTemplate = (userName, courseTitle, courseLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enrollment Confirmed</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f9;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }
            .header {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                padding: 40px 20px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .content {
                padding: 40px 30px;
                color: #374151;
                line-height: 1.6;
            }
            .content h2 {
                color: #111827;
                margin-top: 0;
            }
            .course-card {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
            }
            .course-title {
                font-size: 20px;
                font-weight: 600;
                color: #4f46e5;
                margin-bottom: 10px;
            }
            .btn {
                display: inline-block;
                padding: 14px 30px;
                background-color: #6366f1;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 10px;
                transition: background-color 0.3s;
            }
            .footer {
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #9ca3af;
                background-color: #f9fafb;
            }
            .social-links {
                margin-top: 15px;
            }
            .social-links a {
                margin: 0 10px;
                color: #9ca3af;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Your Learning Journey!</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>Congratulations! You have successfully enrolled in a new course. We're excited to have you on board and can't wait to see what you'll achieve.</p>
                
                <div class="course-card">
                    <div class="course-title">${courseTitle}</div>
                    <p>Unlock your potential and start mastering new skills today.</p>
                    <a href="${courseLink}" class="btn">Start Learning Now</a>
                </div>
                
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                <p>Happy Learning!<br><strong>The Ai-Mentor Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Ai-Mentor. All rights reserved.</p>
                <div class="social-links">
                    <a href="#">Twitter</a>
                    <a href="#">LinkedIn</a>
                    <a href="#">Instagram</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
