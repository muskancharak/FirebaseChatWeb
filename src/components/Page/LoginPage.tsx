import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import "../../styles/Login.css";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { app } from "../../firebase/config";
import GoogleSignin from "../../img/btn_google_signin_dark_pressed_web.png";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);

  //  Email/Password Login
 const onLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const loggedInUser = userCredential.user;

    // Check if email is verified
    if (!loggedInUser?.emailVerified) {
      await signOut(auth);
      console.log("User exists but has not verified email");
      alert("Please verify your email before logging in.");
      return;
    }

    // ✅ Verified user, login success
    setUser(loggedInUser);
    console.log("Email login success:", loggedInUser);
    navigate("/sidePanel");

  } catch (error: any) {
    console.log("Email login error:", error.code, error.message);
    console.log(auth.app.options.projectId);
    
    switch (error.code) {
      case "auth/user-not-found":
        alert("No account found with this email. Please sign up first.");
        break;
      case "auth/wrong-password":
        alert("Incorrect password. Please try again.");
        
        break;
      case "auth/invalid-email":
        alert("Invalid email format. Please enter a valid email.");
        break;
      default:
        alert("Login failed. Please try again later.");
    }
  }
};

  //  Google Login
  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        console.log("Google login success:", result.user);
        navigate("/sidePanel");
      })
      .catch((error) => console.error("Google login error:", error));
  };

  //  Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  //  Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main>
      <section>
        <div>
          <p> ChatWebsite </p>

          {user ? (
            <div className="welcome-box">
              <p>Welcome, {user.email}</p>
              <button onClick={handleLogout} className="logout-btn">
                
                Sign out
              </button>
            </div>
          ) : (
            <>
              {/* Email/Password Login */}
              <form>
                <div>
                  <label htmlFor="email-address">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <button onClick={onLogin}>Login</button>
                </div>
              </form>

              {/* Google Login */}
              <div style={{ marginTop: "15px" }}>
                <button onClick={handleGoogleLogin}>
                  <img src={GoogleSignin} alt="Sign in with Google" />
                </button>
              </div>

              <p className="text-sm text-white text-center">
                No account yet?{" "}
                <NavLink to="/signup">
                  Sign up
                </NavLink>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;
