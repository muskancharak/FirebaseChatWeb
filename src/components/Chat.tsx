
// Chat.tsx
import React, { useEffect, useRef, useState } from "react";
import { getDatabase, ref, push, set, onValue, remove, update } from "firebase/database";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Message, { type ChatMessage } from "./Message";


const Chat: React.FC = () => {
  // Get the currently logged-in Firebase user
  const [user] = useAuthState(auth);

 

  // State to store all messages fetched from Firebase
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  

  // State for the message input field
  const [message, setMessage] = useState("");
  const [items, setItems] = useState(messages);

  // const messagesEndRef = useRef<HTMLDivElement | null>(null); // 👈 Ref to bottom

  // Get Firebase Realtime Database instance
  const db = getDatabase();

   useEffect(() => {
    if (!user) return;
  
    const userRef = ref(db, `users/${user.uid}`);
    set(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
    });
  }, [user, db]);

  // ---------------------------
  // 1️⃣ Fetch messages in real-time
  // ---------------------------
  useEffect(() => {
    // Reference to the "messages" collection in Firebase
    const messagesRef = ref(db, "messages");

    // Listen for changes to messages
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {}; // if no messages, empty object

      // Convert Firebase object to an array of messages with id
      const loadedMessages = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<ChatMessage, "id">)
      
      }));
      
       const messagesRef = ref(db, "messages");
       const newMessageRef = push(messagesRef);

      setMessages(loadedMessages); // Update state
    });


    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [db]);

  //  Auto-scroll to bottom when messages update
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // ---------------------------
  //  Send a new message
  // ---------------------------
  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page reload

    // Check if user is logged in
    if (!user) return;

    // Prevent sending empty messages
    if (message.trim() === "") {
      alert("Enter a valid message");
      return;
    }


    // Reference to "messages" in Firebase
    const messagesRef = ref(db, "messages");

    // Create a new unique key for the message
    const newMessageRef = push(messagesRef);

    // Save the new message in the database
    await set(newMessageRef, {
      uid: user.uid,                        // User ID
      name: user.displayName || "Anonymous", // Display name (fallback)
      avatar: user.photoURL || "",           // Avatar URL (fallback)
      text: message,                      // The actual message
      createdAt: Date.now(),               // Timestamp
      
    });

    // Clear the input field after sending
    setMessage("");
  };
 
 function deleteMessage(id: string) {
  
  const messageRef = ref(db, `messages/${id}`);
  console.log(`messages/${id}` + ",........")
  remove(messageRef)
    .then(() => console.log("Message deleted"))
    .catch((err) => console.error("Error deleting:", err));
}
   
  // 3️⃣ UI for sending + showing messages

  return (
    <>
     {/* <div className="chat-wrapper"> */}
        {/* Messages list */}
      <div className="messages-container">
    {/* {messages.map((msg) => (
      <Message key={msg.id} message={msg}  />
    ))} */}

    <div className="messages-container">
      {messages.map((msg) => (
        <div key={msg.id} className={`message-item ${user?.uid == msg?.uid ? "send" :"receive"}`}>
          <Message message={msg} />
          
          {/* Delete button for each message */}
          {/* {user?.uid === msg?.uid && ( // Only show delete for sender */}
            <button 
              onClick={() => deleteMessage(msg.id)} 
              className="delete-btn"
            >
              Delete
            </button>
          
          {/* {user?.uid === msg?.uid&& ( // Only show delete for sender
            <button 
              onClick={() => deleteMessage(msg.id)} 
              className="delete-btn"
            >
              Delete
            </button>
          )} */}
        </div>
      ))}
    </div>
    
        {/* Message input form */}
        <form onSubmit={sendMessage} className="send-message">
          <label htmlFor="messageInput" hidden>
            Enter Message
          </label>
          <input
            id="messageInput"
            name="messageInput"
            type="text"
            className="form-input__input"
            placeholder="Type message..."
            value={message}
            style={{
            flex: 1,
            padding: "10px"
          }}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          <button type="submit">Send</button>

        </form>

      </div>
      </>
    );
  };

export default Chat;
