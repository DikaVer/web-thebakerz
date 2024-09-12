import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Hr,
    Link,
    Text,
    Button
} from "@react-email/components";

interface VerifyIdentityEmailProps {
    url: string;
}

export function VerifyIdentityEmail({url} : VerifyIdentityEmailProps) {


    return (
        <Html>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100;200;300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Body style={main}>
                <Container style={container}>

                    <Text style={brandText}>
                        TheBakerz
                    </Text>

                    <Hr className="border-[#cccccc]" style={separator}/>
                    <Container style={action_container}>
                        {/*<Text style={{fontWeight: 'bold', fontSize: '20px', textAlign: 'center'}}>Sign in by*/}
                        {/*    Email</Text>*/}
                        <Text style={{color: 'black', fontSize: '16px', margin: '0px 20px', fontWeight: '300'}}>
                            Hello there! Please use the magic link to sign in to TheBakerz by clicking the button below.
                        </Text>
                        <Button
                            href={url}
                            style={{
                                cursor: 'pointer',
                                width: "80%",
                                padding: 8,
                                border: '0',
                                boxSizing: 'border-box',
                                borderRadius: '8px',
                                backgroundColor: '#730c6f',
                                color: '#ffffff',
                                fontSize: '20px',
                                textAlign: 'center',
                                fontWeight: 600,
                                display: 'block',
                                margin: '20px auto',
                            }}
                        >
                            Sign in by Email
                        </Button>
                    </Container>
                    <Img
                        src={`https://assets.api.uizard.io/api/cdn/stream/a4037421-99c8-40c9-b9f9-bcf0369cb641.png`}
                        width="340px"
                        height="164px"
                        alt="Footer Picture"
                        style={footer_img}
                    />
                </Container>
                <Text style={footer}>Need help? Get in touch with
                </Text>
                <Text style={footer_link}>
                    <Link href="mailto:support@thebakerz.com" style={footer_link}>
                        support@thebakerz.com
                    </Link>
                </Text>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f4f4f6",
    color: "#000",
    fontFamily: "'Lexend Deca',sans-serif",
};

const logoContainer = {
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
    flexDirection: "row" as const,
};

const footer_img = {
    margin: "10px auto",
};

const separator = {
    width: "90%",
};

const container = {
      backgroundColor: "#ffffff",
      border: "1px solid #eee",
      borderRadius: "5px",
      marginTop: "10px",
      maxWidth: "360px",
      margin: "0 auto",
      padding: "10px 0 10px",
};

const action_container = {
      backgroundColor: "#ffffff",
      border: "1px solid #eee",
      borderRadius: "5px",
      boxShadow: "0px 2px 8px rgba(20,50,70,.2)",
      marginTop: "20px",
      maxWidth: "310px",
      padding: "10px 0 10px",
};


const brandText = {
      fontSize: "28px",
      margin: "10px",
      fontWeight: 600,
      textAlign: "center" as const,
};


const footer = {
      color: "#000",
      fontSize: "14px",
      fontWeight: 200,
      letterSpacing: "0",
      lineHeight: "23px",
      margin: "0",
      marginTop: "12px",
      fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
      textAlign: "center" as const,
};

const footer_link = {
      color: "#000",
      fontSize: "14px",
      fontWeight: 200,
      letterSpacing: "0",
      lineHeight: "23px",
      margin: "0",
      marginTop: "-4px",
      fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
      textAlign: "center" as const,
      textDecorationLine: "underline",
};