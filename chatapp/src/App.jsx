import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

//make the connection with the backed
const socket = io("https://hike-chatapp.onrender.com");

function App() {
  const [name, setName] = useState("");
  const [enter, setEntered] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [userList, setUserList] = useState([]);
  const [privateTarget, setPrivateTarget] = useState("");

  //server se events ko listen karo
  useEffect(() => {
    //to all the users
    socket.on("receivedMessage", (data) => {
      setChat((prev) => [...prev, `${data.user}:${data.message}`]);
    });

    //private message
    socket.on("personalMessage", ({ from, message }) => {
      setChat((prev) => [...prev, ` ${from}:${message}`]);
    });

    //if the new user join
    socket.on("joined", (message) => {
      setChat((prev) => [...prev, `${message}`]);
    });
    //user list
    socket.on("UserList", (user) => {
      console.log("🟡 Received userList:", user);
      setUserList(user);
    });

    // Cleanup function
    return () => {
      socket.off("receivedMessage");
      socket.off("personalMessage");
      socket.off("joined");
      socket.off("userList");
    };
  }, []);

  //join the chat
  const joinChat = () => {
    if (!name.trim()) {
      return;
    }
    socket.emit("joined", name);
    setEntered(true);
  };

  //send mesage when you press button
  const sendMessage = () => {
    //if no message then return
    if (!message.trim()) {
      return;
    }
    if (privateTarget) {
      socket.emit("personalMessage", {
        to: privateTarget,
        message,
        from: name,
      });
      setChat((prev) => [...prev, `${privateTarget}:${message}`]);
    } else {
      socket.emit("sendMessage", { message, from: name });
    }
    setMessage("");
  };

  return (
    <>
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {!enter ? (
          <>
            <h2
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center", // Added for vertical centering
                background: "orange",
                padding: "15px 20px", // Increased padding
                margin: "20px auto", // Added margin for spacing
                borderRadius: "8px", // Added rounded corners
                color: "white", // Changed text color
                width: "80%", // Constrained width
                maxWidth: "500px", // Maximum width
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Added subtle shadow
                textAlign: "center", // Ensures text centering
                fontSize: "1.5rem", // Slightly larger font
                fontWeight: "600", // Semi-bold weight
              }}
            >
              Enter Your Name to Join
            </h2>
            <input
              type="text"
              placeholder="Enter your name"
              id="username"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              style={{
                padding: "12px 15px",
                width: "300px", // Fixed width works better than percentage for inputs
                background: "#f5f5f5",
                borderRadius: "10px",
                border: "2px solid #ddd",
                outline: "none",
                fontSize: "16px",
                margin: "15px 0",
                color: "blueviolet",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                textAlign: "center",
                display: "block", // Ensures proper centering
                // Hover and focus effects
                ":hover": {
                  borderColor: "#aaa",
                },
                ":focus": {
                  borderColor: "#4285f4",
                  boxShadow: "0 0 0 2px rgba(66, 133, 244, 0.2)",
                  background: "#fff",
                },
              }}
            />
            <button
              type="submit"
              onClick={joinChat}
              style={{
                padding: "5px 20px",
                margin: "10px 0",
                border: "2px solid blue",
                width: "100px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                display: "block",
                borderRadius: "5px",
                textAlign: "center",
                color: "green",
              }}
            >
              Join
            </button>
          </>
        ) : (
          <>
            <h2
              style={{
                textAlign: "center",
                display: "block",
                background: "orange",
                padding: "15px 20px", // Increased padding
                margin: "20px auto", // Added margin for spacing
                borderRadius: "8px", // Added rounded corners
                color: "white", // Changed text color
                width: "80%", // Constrained width
                maxWidth: "500px", // Maximum width
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              Hey! {name}
            </h2>
            <div>
              <select
                style={{
                  textAlign: "left",
                  display: "block",
                  background: "yellowgreen",
                  padding: "5px 15px",
                  margin: "10px",
                  borderRadius: "8px",
                }}
                onChange={(e) => setPrivateTarget(e.target.value)}
                value={privateTarget}
              >
                <option
                  value=""
                  style={{
                    textAlign: "left",
                    display: "block",
                    background: "yellowgreen",
                    padding: "5px 15px",
                    margin: "10px",
                    borderRadius: "8px",
                  }}
                >
                  Connect With
                </option>
                {userList
                  .filter((u) => u !== name)
                  .map((item, idx) => {
                    return (
                      <option
                        key={idx}
                        value={item}
                        style={{
                          textAlign: "left",
                          display: "block",
                          background: "yellowgreen",
                          padding: "5px 15px",
                          margin: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        {item}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div>
              {chat.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
            <div style={{ display: "inline-flex", gap: "5px" }}>
              <input
                style={{
                  padding: "12px 15px",
                  width: "300px", // Fixed width works better than percentage for inputs
                  background: "#f5f5f5",
                  borderRadius: "10px",
                  border: "2px solid #ddd",
                  outline: "none",
                  fontSize: "16px",
                  margin: "15px 0",
                  color: "blueviolet",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  display: "block", // Ensures proper centering
                  // Hover and focus effects
                  ":hover": {
                    borderColor: "#aaa",
                  },
                  ":focus": {
                    borderColor: "#4285f4",
                    boxShadow: "0 0 0 2px rgba(66, 133, 244, 0.2)",
                    background: "#fff",
                  },
                }}
                type="text"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                required
              />
              <button
                type="submit"
                onClick={sendMessage}
                style={{
                  padding: "5px 10px",
                  margin: "15px 0",
                  border: "2px solid green",
                  width: "100px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  display: "block",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: "green",
                }}
              >
                send
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
