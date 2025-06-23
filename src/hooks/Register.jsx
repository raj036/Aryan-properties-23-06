import React, { useState } from "react";
import axios from "../helper/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Mail, Lock, User, Phone, Briefcase, Tag, LogIn } from "lucide-react";
import { useLogin } from "./LoginContext";

const AuthPage = () => {
  const { dispatch } = useLogin();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [register, setRegister] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
    user_type: "",
    phone_no: "",
  });

  const [payload, setpayload] = useState({
    email: "",
    user_password: "",
  });

  const handleChange = (field, value) => {
    setRegister((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleChangelogin = (field, value) => {
    setpayload((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "/api/AriyanspropertiesUsers/login/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response && response.data.token) {
        Swal.fire({
          title: "Login successful!",
          icon: "success",
        });

        const user = response.data.user || response.data;
        const newToken =
          response.data.token || response.data.access_token || token;
        // console.log(user);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          if (newToken) {
            localStorage.setItem("token", newToken);
          }

          dispatch({ type: "LOGIN", payload: { user, token: newToken } });

          // Navigate based on user type
          if (user.user_type === "Admin") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        }
      } else {
        Swal.fire({
          title: "Login failed!",
          text: "Invalid email or password.",
          icon: "error",
        });
      }
    } catch (error) {
      //console.log("Login error:", error);
      Swal.fire({
        title: "Login failed!",
        icon: "error",
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/insert/AriyanspropertiesUser_register/", register);

      Swal.fire({
        title: "Signup successful!",
        icon: "success",
      });
      setIsLogin(true); // Switch to login after successful signup
    } catch (error) {
      // Extract and show a more specific error message if available
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Signup failed! Please try again.";

      Swal.fire({
        title: "Signup failed!",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="bg-white shadow-2xl rounded-2xl flex overflow-hidden w-[80%] max-w-5xl transform hover:scale-[1.02] transition-transform duration-300 ">
        {/* Image Section */}
        <div
          className={`w-1/2 ${
            isLogin ? "order-1" : "order-2"
          } bg-gradient-to-br from-indigo-600 to-blue-500 p-12 flex flex-col items-center justify-center relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 text-center">
            <h1 className="mb-6 text-4xl font-bold text-white">
              {isLogin ? "Welcome Back!" : "Join Us!"}
            </h1>
            <p className="max-w-sm text-lg text-indigo-100">
              {isLogin
                ? "Sign in to continue to your account."
                : "Create an account to start your journey with us."}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-1/2 p-12 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              {isLogin ? "Sign In" : "Sign Up"}
            </h2>
            <p className="mb-8 text-gray-600">
              {isLogin
                ? "Please sign in to continue"
                : "Fill in your details to create an account"}
            </p>

            <form
              onSubmit={isLogin ? handleSubmit : handleSignup}
              className="space-y-6"
            >
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute inset-y-0 left-0 pl-3 h-[100%] w-[30px] text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        onChange={(e) =>
                          handleChange("user_name", e.target.value)
                        }
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute inset-y-0 left-0 pl-3 h-[100%] w-[30px] text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter your phone number"
                        onChange={(e) =>
                          handleChange("phone_no", e.target.value)
                        }
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute inset-y-0 left-0 pl-3 h-[100%] w-[30px] text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        onChange={(e) =>
                          handleChange("user_email", e.target.value)
                        }
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute inset-y-0 left-0 pl-3 h-[100%] w-[30px] text-gray-400" />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        onChange={(e) =>
                          handleChange("user_password", e.target.value)
                        }
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute inset-y-0 left-0 pl-3 h-[100%] w-[30px] text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        onChange={(e) =>
                          handleChangelogin("email", e.target.value)
                        }
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute inset-y-0 left-0 pl-3 h-[100%] w-[30px] text-gray-400" />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        onChange={(e) =>
                          handleChangelogin("user_password", e.target.value)
                        }
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full px-4 py-3 font-medium text-white rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
