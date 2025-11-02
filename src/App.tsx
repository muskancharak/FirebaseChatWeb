

import { auth } from "./firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import "./App.css";


import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SidePanel from "./components/Online";
import SidePanel from "./components/SidePanel/SidePanel";
import GroupChat from "./components/SidePanel/GroupChat";
import GroupName from "./components/SidePanel/GroupName";
import Login from "./components/Page/LoginPage";
import Signup from "./components/Page/SignupPage";
import { Toaster } from "sonner";


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">

      <BrowserRouter>
        

        <Routes>
          
          <Route path="/" element={<Login/>} />
          
          <Route path = "/sidePanel" element={<SidePanel />} />
          <Route path = "/signup" element={<Signup />} />
         
          <Route path = "/groupchat/:groupId" element={<GroupChat />} />
          <Route path = "/groupName" element={<GroupName />} />
          

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

  