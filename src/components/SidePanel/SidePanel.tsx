import React, { useState, useRef, useEffect } from "react";
import "../SidePanel/SidePanel.css";
import userimg from "../../img/image.png";


import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  onDisconnect,
  child,
  update,
  serverTimestamp
} from "firebase/database";
// import { auth } from "../firebase";
import { auth } from "../../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";

import Message, { type ChatMessage } from "../Message";
import firebase from "firebase/compat/app";

// import { requestForToken, listenForMessages } from "../../firebaseMessaging";
import { requestForToken,listenForMessages } from "../../firebase/config";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import GroupChat from "./GroupChat";
// import Message, { type ChatMessage } from "./Message";


interface OnlineUser {
  uid: string;
  userEmail: string;
  displayName?: string;
}




interface Message {
  id: string;
  text: string;
  time: string;
  isOwnMessage: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  messages: Message[];
}

export interface Group {
  
  
  groupId: string;
  groupName: string;
  participants: { uid: string; email: string; displayName?: string }[];
  createdBy: string;
}
type Participant = {
  uid: string;
  email: string;
  displayName?: string;
};


const SidePanel: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  // const [chats, setChats] = useState<Chat[]>(initialChats);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
   const [user] = useAuthState(auth);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const topItemRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState("");
     
    const [receiver, setReceiver] = useState<OnlineUser | null>(null);
    const [onlineUser , setOnlineUser] = useState<OnlineUser[]>([]);
    // const [offlineUser , setOfflineUser] useState<OnlineUser[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: string }>({});
  const [lastMessageTimes, setLastMessageTimes] = useState<{ [key: string]: number }>({});
  const [category, setCategory] = React.useState('');
  const [mode, setMode] = useState('light');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const[editText,setEditText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { groupId } = useParams(); 
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [receiverStatus, setReceiverStatus] = useState<{state: string, last_changed: number} | null>(null);
  const [groups , setGroups] = useState<Group[]>([]);
   const [participants , setParticipants] = useState<Participant[]>([]);
  // const [isSeen , setIsSeen] = useState('false')

  const db = getDatabase();

  let navigate = useNavigate();

const currentUser = auth.currentUser;


useEffect(() => {
  if (!user) return;

  const userRef = ref(db, `users/${user.uid}`);
  update(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
  });
}, [user, db]);

//  Listen to both "users"
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


  useEffect(() => {
    if (!user) return;
    

    //  Request FCM token and save to DB
    requestForToken().then((token) => {
      if (token) {
        const userTokenRef = ref(db, `fcmTokens/${user.uid}`);
        set(userTokenRef, { token }); // overwrite with latest token
        console.log("Token stored in DB for user:", token);
      }
    });

    // Start listening for foreground notifications
    listenForMessages();
    console.log(" working listen")
  }, [user, db]);

useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      console.log(" Permission:", permission);
    });
  }
}, []);

  // ✅ Chat room id (sorted so both users get same ID)
  const chatRoomIds =
    user && receiver ? [user.uid, receiver.uid].sort().join("_") : "";
    console.log("receiver"  + receiver?.uid + receiver?.userEmail)

      // ✅ Fetch messages
      useEffect(() => {
        if (!chatRoomIds) return;
    
        const messagesRef = ref(db, `uimessage/${chatRoomIds}`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
          const data = snapshot.val() || {};
          const loadedMessages =  Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as Omit<ChatMessage, "id">),
          }));

          if(loadedMessages[loadedMessages.length-1].senderId !== user?.uid){
            console.log("working loaded messages")
            const singleMessageRef = ref(db, `uimessage/${chatRoomIds}/${loadedMessages[loadedMessages.length-1].id}`);
            update(singleMessageRef, {
            isSeen: true,
     
    });
  
          }else{
            console.log("not working")
          }
          setMessages(loadedMessages);
        });
    
        return () => unsubscribe();
      }, [db, chatRoomIds]);
    

  const sendMessage = async () => {
  if (!user || !chatRoomIds || !message.trim() || !receiver) return;

  // let imageUrl = {userimg}
  // if(file){
  //   imageUrl = await uploadImage{file,`chatmessages/${chatRoomIds}`}
  // }



  if (editingMessageId) {
    //  update instead of new push
    const messageRef = ref(db, `uimessage/${chatRoomIds}/${editingMessageId}`);
    await update(messageRef, {
      text: message,
      updatedAt: Date.now(),
    });

    setEditingMessageId(null); // exit edit mode
    setMessage(""); // clear input
  } else {
    // new message
    const messagesRef = ref(db, `uimessage/${chatRoomIds}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      uid: user.uid,
      senderId: user.uid,
      receiverId: receiver.uid,
      text: message,
      // imageUrl: imageUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSeen : false,

    });

    setMessage("");
    // setFile(null);
  }
};


  
//updates our status
useEffect(() => {
  


  const userStatusRef = ref(db, `/status/${user?.uid}`);
  const connectedRef = ref(db, ".info/connected");

  const isOfflineForDatabase = {
    state: "offline",
    last_changed: serverTimestamp(),
  };

  const isOnlineForDatabase = {
    state: "online",
    last_changed: serverTimestamp(),
  };

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    // Set up disconnection handler
    onDisconnect(userStatusRef).set(isOfflineForDatabase).then(() => {
      // Immediately mark as online
      set(userStatusRef, isOnlineForDatabase);
    });
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!receiver) return;

  const statusRef = ref(db, `/status/${receiver.uid}`);
  const unsubscribe = onValue(statusRef, (snapshot) => {
    setReceiverStatus(snapshot.val() || null);
  });

  return () => unsubscribe();
}, [receiver, db]);



useEffect(() => {
  if (!user) return;

  const messagesRef = ref(db, "uimessage");

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val() || {};
    const latest: Record<string, string> = {};
    const times: Record<string, number> = {}; 
    

    Object.keys(data).forEach((chatId) => {
      const chatMessages = Object.values(data[chatId]) as any[];
      if (chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        console.log(lastMsg + ":lastMsg")

        // find "other user"
        let otherUserId: string | null = null;
        if (lastMsg.senderId === user.uid) {
          otherUserId = lastMsg.receiverId;
         
        } else if (lastMsg.receiverId  === user.uid) {
          otherUserId = lastMsg.senderId;
         
        }
       

        if (otherUserId) {
          latest[otherUserId] = lastMsg.text;
          times[otherUserId] = lastMsg.createdAt || Date.now();
         
        }
      }
    });

    setLastMessages(latest);
    setLastMessageTimes(times);
  });
 

  return () => unsubscribe();
}, [db, user]);

useEffect(() => {
  const groupsRef = ref(db, "groups");
  const unsubscribe = onValue(groupsRef, (snapshot) => {
    const data = snapshot.val() || {};
    // groups are stored by ID → convert to array
    const loadedGroups: Group[] = Object.entries(data).map(([id, value]) => ({
      groupId: id,
      ...(value as Omit<Group, "groupId">),
    }));
    setGroups(loadedGroups);
  });

  return () => unsubscribe();
}, [db]);





    //  Delete message
    function deleteMessages(id: string) {
      if (!chatRoomIds) return;
      console.log(id + ":id")
  
      const messageRef = ref(db, `uimessage/${chatRoomIds}/${id}`);
      remove(messageRef)
        .then(() => console.log("Message deleted"))
        .catch((err) => console.error("Error deleting:", err));
    }

//Delete all
 function deleteAllMessages() {
      if (!chatRoomIds) return;
      
  
      const messageRef = ref(db, `uimessage/${chatRoomIds}`);
      remove(messageRef)
        .then(() => console.log(" All Message deleted"))
        .catch((err) => console.error("Error deleting:", err));
    }


   
  const handleCategoryChange = (category: React.SetStateAction<string>) => {
     setCategory(category);
     console.log(category);
 }




 const combinedChats = [
  // Groups
  ...groups
    .filter((g) => g?.participants?.some((p) => p.uid === currentUser?.uid))
    .map((g) => ({
      id: g.groupId,
      type: "group",
      name: g.groupName,
      avatar: userimg,
      lastMessage: "group chat",
      lastMessageTime: lastMessageTimes[g.groupId] || 0,
    })),

  // Users
  ...onlineUser.map((u) => ({
    id: u.uid,
    type: "user",
    
    name: u.displayName || u.userEmail,
    avatar: userimg,
    lastMessage: lastMessages[u.uid] ?? "No messages yet",
    lastMessageTime: lastMessageTimes[u.uid] || 0,
    userData : u
  })),
];

//  Sort latest first
const sortedChats = combinedChats.sort(
  (a, b) => b.lastMessageTime - a.lastMessageTime
);

  return (
  <div className="chat-app">
    {/* Sidebar */}
    <div className="sidebar">
      <h2>Chats</h2>
      <button className="group" onClick={() => navigate("/groupname")}>
        Create Group
      </button>

      <div className="chat-list">
        {sortedChats.length > 0 ? (
          sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                (chat.type === "user" && receiver?.uid === chat.id) ||
                (chat.type === "group" && chat.id === selectedChatId)
                  ? "active"
                  : ""
              }`}
             
              onClick={() => {
              if (chat.type === "group") {
                setSelectedChatId(chat.id);   
                navigate(`/groupchat/${chat.id}`);
              } else {
                setReceiver(chat?.userData);
                setSelectedChatId(null);      
              }
            }}

            >
              <img src={chat.avatar} alt={chat.name} className="avatar" />
              <div className="chat-info">
                <p className="chat-name">{chat.name}</p>
                <p className="last-message">
                  <span className="msg-text">
                    {chat.lastMessage.length > 3
                      ? chat.lastMessage.slice(0, 20) + "..."
                      : chat.lastMessage}
                  </span>
                  {chat.lastMessageTime > 0 && (
                    <small>
                      {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No chats yet</p>
        )}
      </div>
    </div>

    {/* Main Chat Panel */}
    <div className="chat-panel">
      {receiver ? (
        <>
          {/* Chat header */}
          <div className="chat-header">
            <img
              src={userimg}
              alt={receiver.userEmail}
              className="avatar-small"
            />
            <h3>{receiver.displayName || receiver.userEmail}</h3>

            {receiverStatus ? (
              receiverStatus.state === "online" ? (
                <span
                  style={{
                    color: "green",
                    fontSize: "12px",
                    flexDirection: "column",
                  }}
                >
                  Online
                </span>
              ) : (
                <span style={{ color: "gray", fontSize: "14px" }}>
                  Last seen{" "}
                  {new Date(receiverStatus.last_changed).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )
            ) : (
              <span
                style={{
                  color: "gray",
                  fontSize: "14px",
                  flexDirection: "column",
                }}
              >
                Unknown
              </span>
            )}

            <div style={{marginBottom:"40px",float:"right"}}>
              <Tooltip title="Delete All">
                <IconButton onClick={deleteAllMessages}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Messages */}
          <div className="messages">
            {messages.map((msg) => (
              <div
              
                key={msg.id}
                className={`message-container ${
                  msg.uid === user?.uid ? "own" : "other"
                }`}
              >
          
                <div className="message">
                  <span>{msg.text}</span>
                  <small>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>

                  {msg?.senderId === user?.uid && (
                    <span
                      style={{
                        marginLeft: "5px",
                        fontSize: "12px",
                        color: "blue",
                      }}
                    >
                      {msg.isSeen ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>

                <div className="message-dropdown">
                  <select
                    name="category"
                    value={category}
                    onChange={(event) => {
                      const action = event.target.value;
                      if (action === "delete") {
                        deleteMessages(msg.id);
                        setCategory("");
                      } else if (action === "edit") {
                        setEditingMessageId(msg.id);
                        setMessage(msg.text);
                        setEditText(msg.text);
                        setCategory("");
                        document.getElementById("chatInput")?.focus();
                      }
                    }}
                  >
                    <option value="">option</option>
                    <option value="delete">Delete</option>
                    <option value="edit">Edit</option>
                  </select>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              id="chatInput"
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      ) : (
        <div className="no-chat-selected">Select a chat to start messaging</div>
      )}
    </div>
  </div>
);
}
export default SidePanel;

