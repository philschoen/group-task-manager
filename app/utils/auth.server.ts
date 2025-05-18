// app/utils/auth.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { prisma } from "./db.server";
import { compare, hash } from "bcryptjs";
import { getSession } from "./session.server";


const SESSION_SECRET = process.env.SESSION_SECRET as string;

const sessionStorage = createCookieSessionStorage({
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        secrets: [SESSION_SECRET],
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
    },
});

async function createUserSession(userId: string, redirectPath: string) {
    const session = await sessionStorage.getSession();
    session.set('userId', userId);
    return redirect(redirectPath, {
        headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
        },
    });
}

export async function getUserFromSession(request: any) {
    const session = await sessionStorage.getSession(
        request.headers.get('Cookie')
    );

    const userId = session.get('userId');
    if (!userId) {
        return null;
    }

    return userId;
}

export async function destroyUserSession(request: any) {
    const session = await sessionStorage.getSession(
        request.headers.get('Cookie')
    );

    return redirect('/', {
        headers: {
            'Set-Cookie': await sessionStorage.destroySession(session),
        },
    });
}


export async function signup({ email, password }: { email: string; password: string }) {
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
        const error = new Error(
            'A user with the provided email address exists already.'
        );
        error.name = 'ExistingUserError';
        throw error;
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
        data: { email: email, password: passwordHash },
    });

    return createUserSession(user.id, '/teams');
}

export async function login({ email, password }: { email: string; password: string }) {
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (!existingUser) {
        const error = new Error(
            'Could not log you in, please check the provided credentials.'
        );
        error.name = 'wrongCredentialsError';
        throw error;
    }

    const passwordCorrect = await compare(password, existingUser.password);

    if (!passwordCorrect) {
        const error = new Error(
            'Could not log you in, please check the provided credentials.'
        );
        error.name = 'wrongCredentialsError';
        throw error;
    }

    return createUserSession(existingUser.id, '/teams');
}

export async function requireUserId(
    request: Request,
    redirectTo: string = new URL(request.url).pathname
) {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    if (!userId) {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/auth?${searchParams.toString()}`); // <-- add '?'
    }
    return userId;
}