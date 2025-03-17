import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Hr,
    Link,
    Text,
    Button,
} from "@react-email/components";
import * as React from "react";

interface VerifyIdentityEmailProps {
    verificationCode: string;
}

export default function VerifyCodeEmail({ verificationCode }: VerifyIdentityEmailProps) {
    // Format the verification code as ###-###
    // const formattedCode = `${verificationCode.slice(0, 3)}-${verificationCode.slice(3)}`
    const formattedCode = verificationCode;

    return (
        <Html>
            <Head>
                <style>
                    {`
            /* Import Lexend Deca font */
            @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100;200;300;400;500;600;700;800;900&display=swap');
            /* Responsive Styles */
            @media only screen and (max-width: 600px) {
              .container {
                padding: 15px !important;
              }
              .description, .greeting, .note, .footerText, .copy-instruction {
                font-size: 14px !important;
              }
              .code {
                font-size: 22px !important;
                padding: 12px !important;
              }
              .copy-button {
                width: 100% !important;
                padding: 12px !important;
                font-size: 14px !important;
              }
            }
          `}
                </style>
            </Head>
            <Body style={main}>
                <Container style={container} className="container">
                    {/* Brand Logo */}
                    <Img
                        src="https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerz_name.png"
                        width="180px"
                        height="auto"
                        alt="TheBakerz Logo"
                        style={logoImg}
                    />
                    <Hr style={separator} />
                    <Container style={actionContainer}>
                        {/*<Text style={greeting}>Hello there!</Text>*/}
                        <Text style={description}>
                            <p>Your verification code is: <strong>{formattedCode}</strong></p>
                            Use the 6-digit code below to verify your identity and sign in to your TheBakerz account. If you didn't request this, please ignore this email or contact support.
                        </Text>
                        <Text style={code} className="code">
                            {formattedCode}
                        </Text>
                        <Text style={note}>
                            This code will expire in 10 minutes.
                        </Text>
                    </Container>
                </Container>
                <Container style={footerContainer}>
                    <Text style={footerText}>
                        Need help? Get in touch with
                    </Text>
                    <Link href="mailto:support@thebakerz.com" style={footerLink}>
                        support@thebakerz.com
                    </Link>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f4f4f6",
    fontFamily: "'Lexend Deca', sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    maxWidth: "500px",
};

const logoImg = {
    display: "block",
    margin: "0 auto 20px",
};

const separator = {
    border: "0",
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "20px 0",
};

const actionContainer = {
    textAlign: "center" as const,
    padding: "20px",
};

const description = {
    fontSize: "16px",
    marginBottom: "20px",
    color: "#555555",
    lineHeight: "1.5",
};

const code = {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#730c6f",
    backgroundColor: "#f0f0f0",
    padding: "15px",
    borderRadius: "5px",
    display: "inline-block",
    letterSpacing: "10px",
    marginBottom: "10px",
    fontFamily: "'Courier New', Courier, monospace",
};

const note = {
    fontSize: "14px",
    color: "#888888",
};

const footerContainer = {
    textAlign: "center" as const,
};

const footerText = {
    fontSize: "14px",
    color: "#555555",
    marginBottom: "5px",
    fontFamily: "Helvetica, Arial, sans-serif",
};

const footerLink = {
    fontSize: "14px",
    color: "#730c6f",
    textDecoration: "underline",
    fontFamily: "Helvetica, Arial, sans-serif",
};
