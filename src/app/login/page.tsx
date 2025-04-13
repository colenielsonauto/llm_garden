import AuthForm from "@/components/ui/auth-form";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    // If user is already logged in, redirect them away from login page
    if (session) {
        redirect('/chat'); // Or '/' if you prefer dashboard as root when logged in
    }

    return <AuthForm />;
} 