import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { authOptions } from "@/lib/authOptions";
import { LandingPageComponent } from "@/components/landing-page";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/chat');
    // Note: redirect throws an error, so code below won't execute
  }
  
  // Explicitly return the component if the user is not logged in
  return <LandingPageComponent />;
} 