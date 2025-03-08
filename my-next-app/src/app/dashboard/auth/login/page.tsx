'use client';

// React Imports
import { useState } from 'react';

// Next Imports
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import axios from 'axios';

// MUI Imports

// Component Imports

// import CustomTextField from '../../../../components/mui/TextField';
// Config Imports


// // Styled Component Imports
// import AuthIllustrationWrapper from '../../../../components/AuthIllustrationWrapper'
import { Eye, EyeOff, Facebook, Github, Twitter } from 'lucide-react';
const API_BASE_URL = 'https://jatin-revoeai-1.onrender.com/api';
const Login = () => {
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // const [token, setToken] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  // Hooks
  const router = useRouter();
  const [, setCookie] = useCookies(['token']);

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token); // Save token in localStorage
      // setToken(token);
      setCookie('token', token, { path: '/' }); // Set cookie with the token

      router.push('/dashboard/display'); // Redirect to dashboard after successful login
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-gray-800 bg-gray-900 shadow-xl">
        <div className="p-8">
          <Link href="/" className="mb-6 flex justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-600 text-center text-2xl font-bold leading-[48px] text-white">
              L
            </div>
          </Link>

          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-gray-200">
              Please sign-in to your account and start the adventure
            </h1>
          </div>

          <form noValidate autoComplete="off" onSubmit={handleLogin} className="space-y-6">
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email or Username
              </label>
              <input
                id="email"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                autoFocus
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
                  placeholder="············"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 pr-10 text-gray-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Login
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-400">New on our platform?</p>
              <Link href="/" className="font-semibold text-blue-500 hover:text-blue-400">
                Create an account
              </Link>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute w-full border-t border-gray-700"></div>
              <span className="relative bg-gray-900 px-2 text-sm text-gray-400">or</span>
            </div>

            <div className="flex justify-center space-x-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Continue with Facebook</span>
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-white transition-colors hover:bg-blue-500"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Continue with Twitter</span>
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-700"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">Continue with GitHub</span>
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
              >
               
                <span className="sr-only">Continue with Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  
  );
};



export default Login;