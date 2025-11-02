import React , {useEffect, useState} from 'react';

import { useParams } from "react-router-dom";
import type { ChatMessage } from '../Message';
import { getDatabase, onValue, push, ref, set } from 'firebase/database';
import userimg from "../../img/image.png";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/config';
import "../../styles/GroupChat.css";
import GroupName from './GroupName';
import type { Group } from './SidePanel';


const GroupChat: React.FC = () => {
  const { groupId } = useParams();  // ✅ get groupId from URL
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [group, setGroup] = useState<Group | null>(null);

  const [message, setMessage] = useState("");
  
  const [participants , setParticipants] = useState<Participant[]>([]);
  const db = getDatabase();
  const [user] = useAuthState(auth);
  
type Participant = {
  uid: string;
  email: string;
  displayName?: string;
};
  useEffect(() => {
    if (!groupId) return;

    const groupRef = ref(db, `groups/${groupId}`);
    const unsubscribe = onValue(groupRef, (snapshot) => {
      const data = snapshot.val();
      // if (data && data.participants) {
      //   setParticipants(data.participants);
      if (data) {
        setGroup(data); // now groupName will be available
      if (data?.participants) {
        const participantsArray = Object.values(data.participants) as Participant[];
        setParticipants(participantsArray);
  }
}

      
    });

    return () => unsubscribe();
  }, [groupId, db]);



  // Load group messages
  useEffect(() => {
    const messagesRef = ref(db, `groupMessages/${groupId}`);
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loadedMessages = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<ChatMessage, "id">),
      }));
      setMessages(loadedMessages);
    });
  }, [db, groupId]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const messagesRef = ref(db, `groupMessages/${groupId}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      uid: user.uid,
      name: user.displayName || user.email,
      avatar: user.photoURL || "",
      text: message,
      createdAt: Date.now(),
    });

    setMessage("");
  };
   
  //  UI for sending + showing messages
 return (
  <div style={{ display: "flex", minHeight: "100vh" }}>
  {/* Sidebar */}
  <div className="groupsidebar">
    <h2>Group Participants</h2>
    <div className="groupchat-list">
      {participants.length > 0 ? (
        participants.map((p) => (
          <div key={p?.uid}>
            <img src={userimg} alt={p?.email} className="groupavatar" />
            {/* <span>{p?.displayName}</span> */}
            <div className="groupchat-info">
              <p className="groupchat-name">{p.displayName || p?.email}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No Participants</p>
      )}
    </div>
  </div>

  {/* Chat Section */}
  <div className="groupchat-wrapper">
    {/* Header now inside wrapper */}
    <div className="groupchat-header">
      <h3>{group?.groupName|| "Group Chat"}</h3>
    </div>

    {/* Messages */}
    <div className="groupmessages-container">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`groupmessage-item ${user?.uid === msg?.uid ? "send" : "receive"}`}
        >
          <img src={msg.avatar || userimg} alt={msg.name} className="groupavatar-small" />
          <div className="groupmessage-content">
            <span className="groupmessage-username">{msg.name}</span>
            <span className="groupmessage-text">{msg.text}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Input */}
    <form onSubmit={sendMessage} className="groupsend-message">
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  </div>
</div>
 )
};

export default GroupChat;
