import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";

interface VerificationEmailProps {
	verificationUrl: string;
}

export const VerificationEmail = ({
	verificationUrl,
}: VerificationEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Verify your email address</Preview>
			<Tailwind>
				<Body className="bg-gray-50 font-sans">
					<Container className="mx-auto max-w-lg bg-white p-8 shadow-sm">
						<Heading className="text-2xl font-bold text-gray-900">
							Verify your email
						</Heading>
						<Text className="text-gray-700">
							Thanks for signing up! Please confirm your email address by
							clicking the button below.
						</Text>
						<Section className="my-6">
							<Link
								href={verificationUrl}
								className="
                  inline-block rounded-md bg-indigo-600 px-6 py-3 text-base
                  font-medium text-white no-underline
                "
							>
								Verify Email
							</Link>
						</Section>
						<Text className="text-sm text-gray-500">
							If you didn&apos;t create an account, you can ignore this email.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default VerificationEmail;
