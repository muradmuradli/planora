'use client'

import { authClient } from "../lib/auth-client";
import { useState } from "react";


export default function Home() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Sign up successful! Check your email or log in.");
        // Redirect to login or dashboard
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 border mb-3"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border mb-3"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border mb-6"
      />

      <button
        onClick={handleSignUp}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded"
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </div>
  );
}
