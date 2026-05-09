/**
 * Premium Enrollment Email Template
 * @param {string} userName - Escaped user name
 * @param {string} courseTitle - Escaped course title
 * @param {string} courseLink - Validated course link
 * @returns {string} HTML Content
 */
export const getEnrollmentEmailTemplate = (userName, courseTitle, courseLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f4f7f9;
                margin: 0;
                padding: 0;
                color: #1a202c;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }
            .header {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            .content {
                padding: 40px;
                line-height: 1.6;
            }
            .content h2 {
                color: #2d3748;
                font-size: 22px;
                margin-top: 0;
            }
            .course-card {
                background: #f8fafc;
                border-left: 4px solid #6366f1;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            .course-title {
                font-weight: 700;
                color: #4a5568;
                font-size: 18px;
            }
            .btn {
                display: inline-block;
                background: #6366f1;
                color: white !important;
                padding: 14px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 20px;
                transition: background 0.3s ease;
            }
            .footer {
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #718096;
                border-top: 1px solid #edf2f7;
            }
            .social-links {
                margin-top: 15px;
            }
            .social-links a {
                margin: 0 10px;
                text-decoration: none;
                color: #a0aec0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to UptoSkills!</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>Congratulations! You've successfully enrolled in your new course. We're excited to have you on this learning journey.</p>
                
                <div class="course-card">
                    <p style="margin: 0; font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 1px;">Enrolled Course</p>
                    <div class="course-title">${courseTitle}</div>
                </div>

                <p>You can access your course materials, tracking your progress, and join the community discussions anytime by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${courseLink}" class="btn">Start Learning Now</a>
                </div>

                <p style="margin-top: 30px;">If you have any questions or need support, feel free to reply to this email or visit our help center.</p>
                
                <p>Happy Learning!<br><strong>The UptoSkills Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} UptoSkills. All rights reserved.</p>
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
