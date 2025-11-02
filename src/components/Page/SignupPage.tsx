// import React, {useState} from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import {  createUserWithEmailAndPassword  } from 'firebase/auth';
// // import { auth } from '../firebase';
// import { auth } from '../../firebase/config';

// const Signup = () => {
//     const navigate = useNavigate();

//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('');

//     const onSubmit = async (e: { preventDefault: () => void; }) => {
//       e.preventDefault()

//       await createUserWithEmailAndPassword(auth, email, password)
//         .then((userCredential) => {
//             // Signed in
//             const user = userCredential.user;
//             console.log(user);
//             console.log("register successful")
//             navigate("/login")
//             // ...
//         })
//         .catch((error) => {
//             const errorCode = error.code;
//             const errorMessage = error.message;
//             console.log(errorCode, errorMessage);
//             // ..
//         });


//     }

//   return (
//     <main >        
//         <section>
//             <div>
//                 <div>                  
//                     <h1> Register </h1>                                                                            
//                     <form>                                                                                            
//                         <div>
//                             <label htmlFor="email-address">
//                                 Email address
//                             </label>
//                             <input
//                                 type="email"
//                                 // label="Email address"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}  
//                                 required                                    
//                                 placeholder="Email address"                                
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="password">
//                                 Password
//                             </label>
//                             <input
//                                 type="password"
//                                 // label="Create password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)} 
//                                 required                                 
//                                 placeholder="Password"              
//                             />
//                         </div>                                             

//                         <button
//                             type="submit" 
//                             onClick={onSubmit}                        
//                         >  
//                             Sign up                                
//                         </button>

//                     </form>
//                     <p>request for verfication</p>

//                     <p>
//                         Already have an account?{' '}
//                         <NavLink to="/login" >
//                             Sign in
//                         </NavLink>
//                     </p>                   
//                 </div>
//             </div>
//         </section>
//     </main>
//   )
// }

// export default Signup;  

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { signupUser, sendVerificationEmail } from '../../firebase/authUtils';
import { signupUser,sendVerificationEmail } from '../../firebase/authService';
import "../../styles/SignUp.css";

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [username,setUsername] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const user = await signupUser(email, password,username);
            await sendVerificationEmail(user);
            alert('Verification email sent! Please check your inbox.');
            

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
  <div className="signup-page">
   

    <form onSubmit={onSubmit}>
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign Up</button>
      {error && <p>{error}</p>}
    </form>
  </div>
);

};

export default Signup;
