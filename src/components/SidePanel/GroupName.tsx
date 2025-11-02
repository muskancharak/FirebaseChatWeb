
import React, { useState , useEffect } from "react";
import userimg from "../../img/image.png";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/config";
import { getDatabase, onValue, push, ref, set, update } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import "../SidePanel/SidePanel.css";
import type { ChatMessage } from "../Message";
import { Checkbox, FormControlLabel } from "@mui/material";

import { CheckBox } from "@mui/icons-material";
import toast from "react-hot-toast";
import { showError } from "../../helpers/showToast";


interface OnlineUser {
  uid: string;
  userEmail: string;
  displayName?: string;
}

const GroupName = () => {
  const [groupName, setGroupName] = useState("");
  const [participants , setParticipants] = useState("");
  const [OnlineUser , setOnlineUser] = useState<OnlineUser[]>([]);
  const [receiver, setReceiver] = useState<OnlineUser | null>(null);
  const [user] = useAuthState(auth);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: string }>({});
  const [lastMessageTimes, setLastMessageTimes] = useState<{ [key: string]: number }>({});
   const [message, setMessage] = useState("");
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading,setIsLoading] = useState(true);
   const[isChecked , setIsChecked] = useState(false);
  const navigate = useNavigate();
  const db = getDatabase();

  const [loading,setLoading] = useState(false);

         //on button clicked

         const  handleDataComponent = ()=>{
         setLoading(!loading);
         }
  

  useEffect(() => {
    const usersRef = ref(db, "users");
    // const statusRef = ref(db, "status");
  
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val() || {};
      const allUsers: OnlineUser[] = Object.values(usersData);
       
      setOnlineUser(
        allUsers.filter((u) => u.uid !== user?.uid) // exclude self
      );
    })
    
  
  
    return () => {
      unsubscribeUsers();
      // unsubscribeStatus();
    };
  }, [user, db]);
 

  
const handleCreate = () => {
  const user = auth.currentUser;

  if (!user) {
    toast.error("You must be logged in!");
    return;
  }

  // Build participants array
  const participants = [
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? null,
    },
    ...OnlineUser
      .filter((u) => selectedUsers.includes(u.uid) && u.uid !== user.uid) // avoid duplicate creator
      .map((u) => ({
        uid: u.uid,
        email: u.userEmail ?? null, // depends on your OnlineUser object
        displayName: u?.displayName ?? null,
      })),
  ];

  if (participants.length <= 1) { 
    // 1 means only creator, no other participants
    toast.error("Please select at least one participant!");
    console.log("error in toast")
    return;
  }

  // Save group to Firebase
  const dbRef = ref(db, "groups");
  const newGroupRef = push(dbRef);
  const groupId = newGroupRef.key;

  set(newGroupRef, {
    groupName,
    createdBy: user.email ?? null,
    participants,
    createdAt: Date.now(),
  })

    .then(() => {
      if(groupName.length<=0){
        toast.error("please give groupname")
      }else{
      toast.success("Group created successfully!");
      console.log("Group ID:", groupId);
      navigate(`/groupchat/${groupId}`);}
    })
    .catch((error) => {
      console.error("Error saving group:", error);
      toast.error("Error creating group");
    });
};



 const handleCheckBox = (uid: string, e: React.ChangeEvent<HTMLInputElement>) => {
  const checked = e.target.checked;

  if (checked) {
    setSelectedUsers((prev) => [...prev, uid]); // add UID
    console.log(uid + " checked");
  } else {
    setSelectedUsers((prev) => prev.filter((id) => id !== uid)); // remove UID
  }

  setIsChecked(checked);

  if (auth.currentUser) {
    set(ref(db, `checkboxResponses/${auth.currentUser.uid}/${uid}`), {
      checked,
      groupName,
    });
  }
};


  return (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    {/* Sidebar (Left Side) */}
    <div className="sidebar" style={{ width: "300px", borderRight: "1px solid #ddd", padding: "20px" }}>
      <h2>Select Participants</h2>
      
      <div className="chat-list">
        {OnlineUser.length > 0 ? (
          OnlineUser.map((u) => (
            <div
              key={u.uid}
              className={`chat-item ${receiver?.uid === u.uid ? "active" : "not active"}`}
              onClick={() => setReceiver(u)}
              
            >
              <img src={userimg} alt={u?.userEmail} className="avatar" />
   
             <input
                type="checkbox"
                checked={selectedUsers.includes(u.uid)}   // ✅ controlled by UID
                onChange={(e) => handleCheckBox(u.uid, e)}
              />
                  
                

              <div className="chat-info">
                <p className="chat-name">{u.displayName || u.userEmail}</p>
                
               
              </div>
              
            </div>
            
          ))
          
        ) : (
          <p>No users online</p>
        )}
        {/* <button onClick={addParticipants} style={{backgroundColor:"lavender", float:"right" , fontSize:"20px"}}>Add</button> */}
      </div>
      
    </div>
    

    {/* Main Content (Right Side) */}
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "20px",
          width: "350px",
          textAlign: "center",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Profile Image */}
        <img
          src={userimg}
          alt="profile"
          style={{
            height: "120px",
            width: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid #007bff",
            marginBottom: "20px",
          }}
        />

        {/* Input Field */}
        <input
          type="text"
          placeholder="Enter Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "2px solid #007bff",
            outline: "none",
            marginBottom: "15px",
            textAlign: "center",
          }}
        />

       

        <button
          style={{
            
            marginTop: "15px",
            padding: "12px 20px",
            background: "#007bff",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={handleCreate}
        >
          Create Group
        </button>
      </div>
    </div>
  </div>
);
};

  

export default GroupName;
