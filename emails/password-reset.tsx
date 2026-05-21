import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "react-email";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export const PasswordResetEmail = ({ resetUrl }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-lg bg-white p-8 shadow-sm">
            <Heading className="text-2xl font-bold text-gray-900">
              Reset your password
            </Heading>
            <Text className="text-gray-700">
              Click the button below to reset your password. This link expires
              in 1 hour.
            </Text>
            <Section className="my-6">
              <Link
                href={resetUrl}
                className="
                  inline-block rounded-md bg-indigo-600 px-6 py-3 text-base
                  font-medium text-white no-underline
                "
              >
                Reset Password
              </Link>
            </Section>
            <Text className="text-sm text-gray-500">
              If you didn&apos;t request this, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
