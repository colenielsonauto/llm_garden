"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"; // Add Image import
// Removed commented out social icons
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Import new date field components
import { JollyDateField } from "@/components/ui/datefield"
import { DateValue } from "react-aria-components"; // For DateField value type
// Import Label from field
import { Label } from "@/components/ui/field";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    className={`rounded-md bg-gradient-to-br from-[#ad4f11] to-[#ad4f11] px-4 py-2 text-lg text-zinc-100 dark:text-zinc-100 
    ring-2 ring-[#ad4f11]/50 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 
    transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-[#ad4f11]/70 ${className}`}
    {...props}
  >
    {children}
  </button>
)

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true); // Default to Sign Up
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [step, setStep] = useState(1); // State for multi-step form

  // State for new fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState<DateValue | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setStep(1); // Reset step when toggling mode
    setError(null);
    // Clear all fields on mode toggle
    setFirstName('');
    setLastName('');
    setBirthday(null);
    setEmail('');
    setPassword('');
  };

  const handleNextStep = () => {
    // Basic validation for step 1
    if (!firstName || !lastName || !birthday) {
        setError('Please fill in all fields for step 1.');
        return;
    }
    setError(null);
    setStep(2);
  };

  const handleAuthSubmit = async () => {
    setIsLoading(true);
    setError(null);

    if (isSignUp && step === 2) {
        // Final signup submission
        if (!email || !password) {
             setError('Please enter email and password.');
             setIsLoading(false);
             return;
        }

        const endpoint = '/api/auth/signup';
        // Format birthday for backend (e.g., ISO string)
        const birthdayString = birthday?.toString(); // Or format as YYYY-MM-DD
        const body = JSON.stringify({ 
            firstName, 
            lastName, 
            birthday: birthdayString, 
            email, 
            password 
        });

        try {
            const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            console.log('Signup successful:', data);
            
            // --- Auto-login after successful signup ---
            console.log('Attempting auto-login after signup...');
            const loginResult = await signIn('credentials', {
                email, // Use the email just signed up with
                password, // Use the password just signed up with
                redirect: false, // Prevent default redirect
            });

            if (loginResult?.error) {
                console.error("Auto-login failed after signup:", loginResult.error);
                // Signup worked, but auto-login failed. Redirect to login page with error.
                setError('Account created, but auto-login failed. Please sign in manually.');
                setIsSignUp(false); // Switch to login view
                setStep(1); // Reset step
            } else if (loginResult?.ok) {
                console.log('Auto-login successful.');
                // Clear form fields before redirecting
                setFirstName(''); setLastName(''); setBirthday(null);
                setEmail(''); setPassword('');
                // Redirect to the main application page
                router.push('/'); 
            } else {
                 // Unexpected signIn result
                 console.error("Unexpected signIn result after signup:", loginResult);
                 setError('Account created, but failed to automatically log in. Please sign in manually.');
                 setIsSignUp(false); // Switch to login view
                 setStep(1); // Reset step
            }
            // No need to setIsLoading(false) here as redirection happens or error is set

        } catch (err: unknown) {
            console.error("Signup error:", err);
            let message = 'An unexpected error occurred during signup.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            setIsLoading(false); // Ensure loading stops on signup fetch error
        }
    } else { // Handle Login (step doesn't matter for login)
        // --- Handle Login --- (logic remains similar)
        if (!email || !password) {
            setError('Please enter email and password.');
            setIsLoading(false);
            return;
        }
        try {
            const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
            });
            // ... (rest of login error/success handling) ...
             if (result?.error) {
              setError('Invalid email or password.'); 
            } else if (result?.ok) {
                router.push('/');
            } else {
                 setError('An unexpected issue occurred during login.');
            }
        } catch (err) {
            console.error("Error calling signIn:", err);
            setError('An error occurred connecting to the server.');
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="relative bg-white dark:bg-zinc-950 py-20 text-zinc-800 dark:text-zinc-200 selection:bg-zinc-300 dark:selection:bg-zinc-600">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeInOut" }}
        className="relative z-10 mx-auto w-full max-w-xl p-4"
      >
        <Logo />
        <Header isSignUp={isSignUp} toggleMode={toggleMode} />
        {error && (
          <div className="my-4 text-center text-red-500 dark:text-red-400">
            {error}
          </div>
        )}
        {/* Render form based on step and mode */}
        {isSignUp ? (
            // Signup Flow
            <SignUpForm 
                step={step} 
                onNextStep={handleNextStep} 
                onSubmit={handleAuthSubmit} 
                isLoading={isLoading}
                firstName={firstName} setFirstName={setFirstName}
                lastName={lastName} setLastName={setLastName}
                birthday={birthday} setBirthday={setBirthday}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
            />
        ) : (
            // Login Flow
            <LoginForm 
                onSubmit={handleAuthSubmit} 
                isLoading={isLoading}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
            />
        )}
        
        {/* Only show terms for final signup step */} 
        {(isSignUp && step === 2) && <TermsAndConditions />} 
      </motion.div>
      <BackgroundDecoration />
    </div>
  )
}

const Logo: React.FC = () => (
  <div className="mb-6 flex items-center justify-center">
    <Image src="/logo.png" alt="AI Garden Logo" width={32} height={32} className="mr-2" />
    <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">AI Garden</span>
  </div>
)

interface HeaderProps {
  isSignUp: boolean;
  toggleMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSignUp, toggleMode }) => (
  <div className="mb-6 text-center">
    <h1 className="text-2xl font-semibold">
      {isSignUp ? "Create your account" : "Sign in to your account"}
    </h1>
    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
      {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
      <button
        type="button"
        onClick={toggleMode}
        className="text-[#ad4f11] dark:text-[#ad4f11] hover:underline focus:outline-none bg-transparent border-none p-0 m-0 cursor-pointer"
      >
        {isSignUp ? "Sign in." : "Create one."}
      </button>
    </p>
  </div>
)

// --- LOGIN FORM COMPONENT --- (Separate Component)
interface LoginFormProps {
    onSubmit: () => Promise<void>; // Changed to trigger function without args
    isLoading: boolean;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, email, setEmail, password, setPassword }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmit(); // Call the submit handler passed from AuthForm
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
       {/* Email Input */}
       <div className="mb-3">
         <Label htmlFor="email-input">Email</Label>
         <input
           id="email-input"
           type="email"
           placeholder="your.email@provider.com"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           required
           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
           disabled={isLoading}
         />
       </div>
       {/* Password Input */}
       <div className="mb-3">
         <div className="mb-1.5 flex items-end justify-between">
            <Label htmlFor="password-input">Password</Label>
            <a href="#" className="text-sm text-[#ad4f11] dark:text-[#ad4f11] hover:underline">Forgot?</a>
         </div>
         <input
           id="password-input"
           type="password"
           placeholder="••••••••••••"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           required
           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
           disabled={isLoading}
         />
       </div>
       {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
    </form>
  );
};

// --- SIGNUP FORM COMPONENT --- (New Multi-Step Component)
interface SignUpFormProps {
    step: number;
    onNextStep: () => void;
    onSubmit: () => Promise<void>;
    isLoading: boolean;
    firstName: string;
    setFirstName: React.Dispatch<React.SetStateAction<string>>;
    lastName: string;
    setLastName: React.Dispatch<React.SetStateAction<string>>;
    birthday: DateValue | null;
    setBirthday: React.Dispatch<React.SetStateAction<DateValue | null>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ 
    step, 
    onNextStep, 
    onSubmit, 
    isLoading, 
    firstName, setFirstName, 
    lastName, setLastName, 
    birthday, setBirthday,
    email, setEmail,
    password, setPassword
}) => {

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmit(); // Call the final submit handler passed from AuthForm
  }

  return (
    <form onSubmit={handleFinalSubmit} className="space-y-3">
      {step === 1 && (
        <>
          {/* First Name Input */}
           <div className="mb-3">
             <Label htmlFor="firstName-input">First Name</Label>
             <input
               id="firstName-input"
               type="text"
               placeholder="First Name"
               value={firstName}
               onChange={(e) => setFirstName(e.target.value)}
               required
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               disabled={isLoading}
             />
           </div>
           {/* Last Name Input */}
            <div className="mb-3">
             <Label htmlFor="lastName-input">Last Name</Label>
             <input
               id="lastName-input"
               type="text"
               placeholder="Last Name"
               value={lastName}
               onChange={(e) => setLastName(e.target.value)}
               required
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               disabled={isLoading}
             />
           </div>
          {/* Birthday Input */}
          <JollyDateField 
            label="Birthday" 
            value={birthday}
            onChange={setBirthday} 
            isRequired 
            className="mb-3"
            granularity="day"
          />
          {/* Continue Button */}
          <Button type="button" className="w-full" onClick={onNextStep} disabled={isLoading}>
            Continue
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Email Input */}
           <div className="mb-3">
             <Label htmlFor="email-input">Email</Label>
             <input
               id="email-input"
               type="email"
               placeholder="your.email@provider.com"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               disabled={isLoading}
             />
           </div>
          {/* Password Input */}
          <div className="mb-3">
             <Label htmlFor="password-input">Password</Label>
             <input
               id="password-input"
               type="password"
               placeholder="••••••••••••"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               disabled={isLoading}
             />
           </div>
          {/* Create Account Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </>
      )}
    </form>
  )
}

// --- TERMS & CONDITIONS --- (Removed props)
const TermsAndConditions: React.FC = () => (
  <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
    By signing up, you agree to our{" "}
    <Link className="text-[#ad4f11] dark:text-[#ad4f11] hover:underline" href="/terms">
      Terms & Conditions
    </Link>{/* Updated link */}
    {" "}and{" "}
    <Link className="text-[#ad4f11] dark:text-[#ad4f11] hover:underline" href="/privacy">
      Privacy Policy
    </Link>{/* Updated link */}.
  </p>
)

const BackgroundDecoration: React.FC = () => {
  const { theme } = useTheme()
  const [gradientStyle, setGradientStyle] = useState({})

  React.useEffect(() => {
    const isDarkTheme = theme === "dark"
    setGradientStyle({
      background: `radial-gradient(circle at top right, ${isDarkTheme ? "rgba(173, 79, 17, 0.15)" : "rgba(173, 79, 17, 0.1)"} 0%, transparent 50%), 
                   radial-gradient(circle at bottom left, ${isDarkTheme ? "rgba(173, 79, 17, 0.15)" : "rgba(173, 79, 17, 0.1)"} 0%, transparent 50%)`,
    })
  }, [theme])

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      style={gradientStyle}
    />
  )
}

export default AuthForm
