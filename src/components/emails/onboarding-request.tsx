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

interface OnboardingEmailProps {
    phone: string;
    fullName: string;
    email: string;
}

export default function OnboardingRequest({ phone, email, fullName }: OnboardingEmailProps) {
    // Format the verification code as ###-###

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
                    {/* Brand Logo as Image */}
                    <Img
                        src="https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/emails/Logo-NGDMW9ZQoUrHdT0FxmnD6vMbxs1hrY"
                        width="150px"
                        height="auto"
                        alt="TheBakerz Logo"
                        style={logoImg}
                    />

                    <Hr style={separator} />

                    <Container style={actionContainer}>
                        <Text style={greeting}>
                            We catch him! 🎉
                        </Text>
                        <Text style={description}>
                            Phone number: <span style={{ fontWeight: 'bold' }}>{phone}</span>
                        </Text>
                        <Text style={description}>
                            Full Name: <span style={{ fontWeight: 'bold' }}>{fullName}</span>
                        </Text>
                        <Text style={description}>
                            Email: <span style={{ fontWeight: 'bold' }}>{email}</span>
                        </Text>
                    </Container>

                    <Img
                        src={`https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/emails/Brazuca-fNZSckC7ubnXtJDCydSW7e1kdKIkOm`}
                        width="100%"
                        height="auto"
                        alt="Footer Picture"
                        style={footerImg}
                    />
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
    color: "#000",
    fontFamily: "'Lexend Deca', sans-serif",
    padding: "20px",
};

const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #eee",
    borderRadius: "8px",
    margin: "0 auto",
    padding: "20px",
    maxWidth: "500px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
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

const greeting = {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#333333",
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

const copyInstruction = {
    fontSize: "16px",
    color: "#555555",
    marginBottom: "20px",
};

const note = {
    fontSize: "14px",
    color: "#888888",
};

const footerImg = {
    width: "100%",
    height: "auto",
    marginTop: "20px",
    borderRadius: "8px",
};

const footerContainer = {
    textAlign: "center" as const,
    marginTop: "30px",
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
