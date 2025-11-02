
// Message.tsx
import React from "react";
import { auth } from "../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth"; 
import { getDatabase, ref, remove } from "firebase/database";
import SidePanel from "./SidePanel/SidePanel";
import { redirect, useNavigate } from "react-router";
const db = getDatabase();
export interface ChatMessage {
  isSeen: any;
  imageUrl: any;
  receiverId: any;
  senderId: string;
  id: string;
  uid: string;
  avatar: string;
  name: string;
  text: string;
  createdAt: number;
 
 
}

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [user] = useAuthState(auth);
   let navigate = useNavigate();


  return (
    <div className={`chat-bubble ${message.uid === user?.uid ? "right" : ""}`}>
      <img className="chat-bubble__left" src={message.avatar} alt="user avatar" />
      <div className="chat-bubble__right" style ={{backgroundColor:"pink"}}>
        <p className="user-name">{message.name}</p>
        <p className="user-message">{message.text}</p>
        <button onClick={()=> navigate('/sidepanel')}></button>
        
        </div>
    </div>
  );
};

export default Message;

