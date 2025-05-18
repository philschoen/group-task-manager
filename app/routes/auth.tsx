import { redirect, type ActionFunctionArgs, type LinksFunction } from '@remix-run/node';
import AuthForm from '~/components/AuthForm';
import { login, signup } from '~/utils/auth.server';
import { validateCredentials } from '~/utils/validation.server';

export default function AuthPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <AuthForm />
        </div>
    );
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;
    const authMode = searchParams.get('mode') || 'login';

    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const credentials = { email: String(email), password: String(password) };

    try {
        validateCredentials(credentials);
    } catch (error) {
        return error;
    }

    try {
        if (authMode === 'login') {
            return await login(credentials);
        } else {
            return await signup(credentials);
        }
    } catch (error: any) {

        console.log(error.message);

        if (error instanceof Error && error.name === 'ExistingUserError') {
            return { credentials: error.message };
        }
    }
    return { credentials: 'Invalid username or password.' };
}

export const links: LinksFunction = () => []; // Empty array since we're using Tailwind