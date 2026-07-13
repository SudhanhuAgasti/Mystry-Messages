import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your OTP for Mystery Message</Preview>

      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "40px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Heading
            style={{
              textAlign: "center",
              color: "#111827",
              marginBottom: "30px",
            }}
          >
            Welcome to Mystery Message 🎉 !!
          </Heading>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
            }}
          >
            Hi <strong>{username}</strong>,
          </Text>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "24px",
            }}
          >
            Thank you for signing up with <strong>Mystery Message</strong>.
            Please use the following One-Time Password (OTP) to verify your
            email address.
          </Text>

          <Section
            style={{
              textAlign: "center",
              margin: "35px 0",
            }}
          >
            <Text
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                letterSpacing: "8px",
                color: "#2563eb",
                backgroundColor: "#eff6ff",
                display: "inline-block",
                padding: "16px 32px",
                borderRadius: "10px",
              }}
            >
              {otp}
            </Text>
          </Section>

          <Text
            style={{
              fontSize: "15px",
              color: "#4b5563",
              lineHeight: "24px",
            }}
          >
            This OTP is valid for <strong>10 minutes</strong>. Please do not
            share it with anyone for security reasons.
          </Text>

          <Hr />

          <Text
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            If you didn't create an account on Mystery Message, you can safely
            ignore this email.
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: "12px",
              marginTop: "20px",
            }}
          >
            © 2026 Mystery Message. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}