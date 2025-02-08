import smtplib
from email.mime.text import MIMEText

def test_send_email():
    sender_email = "virajv2005@gmail.com"
    recipient_email = "vrvora_b23@ce.vjti.ac.in"
    smtp_password = "btjr mnzc ozto ntcg"  # Replace with your App Password

    # Create the email
    msg = MIMEText("This is a test email.")
    msg['Subject'] = "Test Email"
    msg['From'] = sender_email
    msg['To'] = recipient_email

    # Send the email
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Upgrade the connection to secure
            server.login(sender_email, smtp_password)  # Use App Password here
            server.send_message(msg)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error: {e}")

# Run the test
test_send_email()