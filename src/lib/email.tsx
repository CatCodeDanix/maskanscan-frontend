import { Resend } from "resend";
import PasswordResetEmail from "../../emails/password-reset";
import VerificationEmail from "../../emails/verification";

// Email provider interface – add any provider you might switch to later
interface EmailProvider {
	send(options: {
		to: string | string[];
		subject: string;
		html?: string;
		react?: React.ReactElement;
	}): Promise<void>;
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const resendProvider: EmailProvider = {
	async send({ to, subject, react }) {
		await resend.emails.send({
			from: process.env.EMAIL_FROM!,
			to,
			subject,
			react,
		});
	},
};

// Change this to switch providers
const emailProvider: EmailProvider = resendProvider;

// Generic email functions
export async function sendPasswordResetEmail(userEmail: string, url: string) {
	await emailProvider.send({
		to: userEmail,
		subject: "Reset your password",
		react: <PasswordResetEmail resetUrl={url} />,
	});
}

export async function sendVerificationEmail(userEmail: string, url: string) {
	await emailProvider.send({
		to: userEmail,
		subject: "Verify your email address",
		react: <VerificationEmail verificationUrl={url} />,
	});
}
