import { useState } from "react";
import { Dumbbell, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState(
    "owner@srigfitness.com"
  );

  const [password, setPassword] = useState(
    "ChangeMe@123"
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full" />

      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 items-center justify-center shadow-xl shadow-blue-500/20">
            <Dumbbell size={30} />
          </div>

          <h1 className="text-3xl font-bold mt-5">
            Sri G Fitness
          </h1>

          <p className="text-slate-400 mt-2">
            Club Management Dashboard
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-7">
            <h2 className="text-xl font-bold">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Login to manage your fitness club
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="text-sm text-slate-300">
                Email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full h-12 bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 outline-none focus:border-blue-500 transition"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Password
              </label>

              <div className="relative mt-2">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full h-12 bg-slate-950 border border-white/10 rounded-xl pl-11 pr-12 outline-none focus:border-blue-500 transition"
                  placeholder="Enter password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition font-semibold"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Sri G Fitness Club Management System
        </p>
      </div>
    </div>
  );
};

export default Login;