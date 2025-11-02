import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile, type User } from 'firebase/auth';
import { auth } from './config';

const actionCodeSettings = {
  url: "http://localhost:5173/SidePanel",
  handleCodeInApp: true,
};

// Signup function
export const signupUser = async (email: string, password: string, username: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // updateProfile MUST come before return
  await updateProfile(user, { displayName: username });

  return user;
};

// Send verification email
export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user, actionCodeSettings); // pass actionCodeSettings
    return { success: true, message: "Verification email sent!" };
  } catch (err: any) {
    if (err.code === "auth/too-many-requests") {
      return {
        success: false,
        message: "Too many requests. Please wait a few minutes before trying again.",
      };
    } else {
      return { success: false, message: err.message };
    }
  }
};

// Full signup + verification flow
export const handleSignup = async (email: string, password: string,username:string) => {
  try {
    const user = await signupUser(email, password,username);

    const result = await sendVerificationEmail(user);
    if (result.success) {
      alert(result.message);
      await signOut(auth); // optional: force sign-out until verification
    } else {
      alert(result.message);
    }
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      alert("Email is already in use. Try logging in instead.");
    } else {
      alert(error.message);
    }
  }
};
