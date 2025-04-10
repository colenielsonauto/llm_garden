"use client"

import * as React from "react"
import { useState } from "react"
import { Box } from "lucide-react"
// Removed commented out social icons
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { signIn } from 'next-auth/react'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    className={`rounded-md bg-gradient-to-br from-[#018771] to-[#018771] px-4 py-2 text-lg text-zinc-100 dark:text-zinc-100 
    ring-2 ring-[#018771]/50 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 
    transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-[#018771]/70 ${className}`}
    {...props}
  >
    {children}
  </button>
)

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null); // Clear error on mode switch
  };

  const handleAuthSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(null);

    if (isSignUp) {
      // --- Handle Signup --- 
      const endpoint = '/api/auth/signup';
      const body = JSON.stringify({ name: formData.name, email: formData.email, password: formData.password });
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
        // Signup successful - maybe prompt user to login now?
        console.log('Signup successful:', data);
        // Automatically switch to login mode after successful signup
        setIsSignUp(false);
        // Optionally show a success message instead of error
        // setError("Account created! Please sign in."); 
      } catch (err: unknown) {
        console.error("Signup error:", err);
        let message = 'An unexpected error occurred during signup.';
        if (err instanceof Error) {
            message = err.message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- Handle Login using next-auth (using callbackUrl) ---
      try {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl: '/', // Specify desired redirect path on success
        });

        if (result?.error) {
          // Handle authentication errors (e.g., wrong password)
          console.error("Login error from next-auth:", result.error);
          // Use a user-friendly message. next-auth might return specific error keys
          // depending on config, or a generic message.
          setError('Invalid email or password.'); 
        } 
        // No need for router.push here, signIn handles redirect
      } catch (err) {
        // Handle network errors or other issues calling signIn
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
        <LoginForm
            isSignUp={isSignUp}
            onSubmit={handleAuthSubmit}
            isLoading={isLoading}
        />
        <TermsAndConditions isSignUp={isSignUp} />
      </motion.div>
      <BackgroundDecoration />
    </div>
  )
}

const Logo: React.FC = () => (
  <div className="mb-6 flex items-center justify-center">
    <Box size={32} className="mr-2 text-[#018771]" /> 
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
        className="text-[#018771] dark:text-[#018771] hover:underline focus:outline-none bg-transparent border-none p-0 m-0 cursor-pointer"
      >
        {isSignUp ? "Sign in." : "Create one."}
      </button>
    </p>
  </div>
)

interface LoginFormProps {
    isSignUp: boolean;
    onSubmit: (formData: Record<string, string>) => Promise<void>;
    isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ isSignUp, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const formData: Record<string, string> = { email, password };
    if (isSignUp) {
        formData.name = name;
    }
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isSignUp && (
        <div className="mb-3">
          <label
            htmlFor="name-input"
            className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
          >
            Name
          </label>
          <input
            id="name-input"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700
            bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
            placeholder-zinc-400 dark:placeholder-zinc-500
            ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-[#018771]"
            disabled={isLoading}
          />
        </div>
      )}
      <div className="mb-3">
        <label
          htmlFor="email-input"
          className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
        >
          Email
        </label>
        <input
          id="email-input"
          type="email"
          placeholder="your.email@provider.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-[#018771]"
          disabled={isLoading}
        />
      </div>
      <div className="mb-3">
        <div className="mb-1.5 flex items-end justify-between">
          <label
            htmlFor="password-input"
            className="block text-zinc-500 dark:text-zinc-400"
          >
            Password
          </label>
          {!isSignUp && (
             <a href="#" className="text-sm text-[#018771] dark:text-[#018771] hover:underline">
               Forgot?
             </a>
          )}
        </div>
        <input
          id="password-input"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isSignUp ? 8 : undefined}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-[#018771]"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
      </Button>
    </form>
  )
}

// NOTE: The SocialButtons, SocialButton, and Divider components are now unused
// and could be removed entirely if desired, but are left here for now.
/*
const SocialButtons: React.FC = () => (...)
const SocialButton: React.FC<...> = ({ icon, fullWidth, children }) => (...)
const Divider: React.FC = () => (...)
*/

interface TermsAndConditionsProps {
  isSignUp: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ isSignUp }) => (
  <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
    By {isSignUp ? "signing up" : "signing in"}, you agree to our <br />
    <Link href="/terms" className="text-[#018771] dark:text-[#018771] hover:underline">
      Terms
    </Link> and <Link href="/privacy" className="text-[#018771] dark:text-[#018771] hover:underline">
      Privacy Policy
    </Link>.
  </div>
)

const BackgroundDecoration: React.FC = () => {
  const { theme } = useTheme()
  const [gradientStyle, setGradientStyle] = useState({})

  React.useEffect(() => {
    const isDarkTheme = theme === "dark"
    setGradientStyle({
      background: `radial-gradient(circle at top right, ${isDarkTheme ? "rgba(1, 135, 113, 0.15)" : "rgba(1, 135, 113, 0.1)"} 0%, transparent 50%), 
                   radial-gradient(circle at bottom left, ${isDarkTheme ? "rgba(1, 135, 113, 0.15)" : "rgba(1, 135, 113, 0.1)"} 0%, transparent 50%)`,
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
