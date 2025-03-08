// src/app/auth/signup.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
const API_BASE_URL = 'https://jatin-revoeai-1.onrender.com/api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const router = useRouter()

  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        name,
      });
      router.push('/dashboard/auth/login'); // Redirect to login after successful signup
    } catch (err) {
      setError('Error during signup');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
    <div className="w-full max-w-md overflow-hidden rounded-lg border border-gray-800 bg-gray-900 shadow-xl">
      <div className="p-8">
        <Link href="/" className="mb-6 flex justify-center">
          <div className="h-12 w-12 rounded-full bg-blue-600 text-center text-2xl font-bold leading-[48px] text-white">
            S
          </div>
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-200">Create an account</h1>
          <p className="mt-2 text-sm text-gray-400">Join us and start your journey</p>
        </div>

        <form noValidate autoComplete="off" onSubmit={handleSignup} className="space-y-6">
          {error && <p className="rounded-md bg-red-900/20 p-3 text-sm text-red-500">{error}</p>}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={isPasswordShown ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 pr-10 text-gray-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                onClick={handleClickShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {isPasswordShown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">{isPasswordShown ? "Hide password" : "Show password"}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Create Account
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">Already have an account?</p>
            <Link href="/dashboard/auth/login" className="font-semibold text-blue-500 hover:text-blue-400">
              Sign in instead
            </Link>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-gray-700"></div>
            <span className="relative bg-gray-900 px-2 text-sm text-gray-400">or</span>
          </div>

          <p className="text-center text-sm text-gray-400">
          
          </p>
        </form>
      </div>
    </div>
  </div>)
}

export default Signup;
