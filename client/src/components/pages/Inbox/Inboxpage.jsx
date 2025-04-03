import React, { useState, useEffect, useRef } from "react";
import "./Inboxpage.css";
import HeaderHomepage from "../../common/headerhomepage";
import axiosInstance from "../../../services/axiosInstance";

function Inboxpage() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") || ""
  );

  // Fetch all conversations on component mount
  useEffect(() => {
    // Make sure we have the current user ID
    setCurrentUserId(localStorage.getItem("userId") || "");

    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          "/api/messaging/conversations"
        );
        if (response.data.success) {
          setConversations(response.data.conversations);

          // Set first conversation active if there are any
          if (response.data.conversations.length > 0 && !activeConversationId) {
            setActiveConversationId(response.data.conversations[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) return;

      try {
        const response = await axiosInstance.get(
          `/api/messaging/conversations/${activeConversationId}/messages`
        );
        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setNewConversationName(query);

    if (query.length > 0) {
      setShowDropdown(true);
      setIsSearching(true);

      try {
        // Use the API to search for users and employers
        const response = await axiosInstance.get(
          `/api/messaging/search?query=${query}`
        );
        if (response.data.success) {
          setSearchResults(response.data.results);
        }
      } catch (error) {
        console.error("Error searching for users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Handle user selection from dropdown
  const handleSelectUser = (user) => {
    const firstName = user.profileDetails.firstName || "";
    const lastName = user.profileDetails.lastName || "";
    const companyName = user.profileDetails.companyName || "";

    let displayName;
    if (user.role === "employer" && companyName) {
      displayName = `${firstName} ${lastName} (${companyName})`;
    } else {
      displayName = `${firstName} ${lastName}`;
    }

    setNewConversationName({
      name: displayName,
      id: user._id,
    });
    setShowDropdown(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;

    try {
      const response = await axiosInstance.post("/api/messaging/messages", {
        conversationId: activeConversationId,
        content: newMessage,
      });

      if (response.data.success) {
        // Add new message to the UI
        setMessages([...messages, response.data.message]);

        // Update conversation's last message
        setConversations(
          conversations.map((convo) => {
            if (convo._id === activeConversationId) {
              return {
                ...convo,
                lastMessage: response.data.message,
              };
            }
            return convo;
          })
        );

        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationName || !newConversationName.id) return;

    try {
      const response = await axiosInstance.post(
        "/api/messaging/conversations",
        {
          participantId: newConversationName.id,
        }
      );

      if (response.data.success) {
        const newConvo = response.data.conversation;

        // Check if this is truly a new conversation
        if (
          !response.data.message ||
          response.data.message !== "Conversation already exists"
        ) {
          // Ensure the conversation has the proper name
          const updatedNewConvo = {
            ...newConvo,
            participants: newConvo.participants.map((p) => {
              if (
                p.userId._id === newConversationName.id ||
                p.userId === newConversationName.id
              ) {
                // This is the participant we just selected, make sure they have the right name
                return {
                  ...p,
                  userId: {
                    ...p.userId,
                    username:
                      typeof newConversationName === "object"
                        ? newConversationName.name
                        : newConversationName,
                  },
                };
              }
              return p;
            }),
          };

          setConversations([updatedNewConvo, ...conversations]);
        } else {
          // Find the existing conversation and make it active
          const existingConvo = conversations.find((c) =>
            c.participants.some(
              (p) =>
                p.userId._id === newConversationName.id ||
                p.userId === newConversationName.id
            )
          );
          if (existingConvo) {
            setActiveConversationId(existingConvo._id);
          } else {
            // If we can't find it in our current list, add the returned conversation
            setConversations([newConvo, ...conversations]);
            setActiveConversationId(newConvo._id);
          }
        }

        // Set this as active conversation
        setActiveConversationId(newConvo._id);
        setShowNewConversation(false);
        setNewConversationName("");

        // Fetch messages for this conversation
        const messagesResponse = await axiosInstance.get(
          `/api/messaging/conversations/${newConvo._id}/messages`
        );
        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.messages);
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Get the other participant in conversation (not the current user)
  const getOtherParticipant = (conversation) => {
    if (
      !conversation ||
      !conversation.participants ||
      !conversation.participants.length
    ) {
      console.log("Invalid conversation data:", conversation);
      return { username: "Unknown" };
    }

    // Find the participant that is NOT the current user
    const otherParticipant = conversation.participants.find((p) => {
      if (!p.userId) {
        return false;
      }

      const participantId = p.userId._id || p.userId;
      return (
        participantId !== currentUserId &&
        participantId.toString() !== currentUserId.toString()
      );
    });

    // If we couldn't find another participant, return the first one (fallback)
    if (!otherParticipant || !otherParticipant.userId) {
      console.log("Could not find other participant, using first participant");
      return conversation.participants[0]?.userId || { username: "Unknown" };
    }

    return otherParticipant.userId;
  };

  // Get formatted date for messages
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format the last active time
  const formatLastSeen = (dateString) => {
    if (!dateString) return "Never seen";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Active now";
    if (diffMins < 60) return `Last seen ${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last seen ${diffHours} hours ago`;

    return `Last seen ${date.toLocaleDateString()}`;
  };

  // Get the active conversation object
  const activeConversation = conversations.find(
    (convo) => convo._id === activeConversationId
  );

  // Update this function to correctly display the message sender name
  const getMessageSenderName = (message) => {
    // Check if sender is object or ID
    const senderId = message.sender._id || message.sender;
    const isCurrentUser =
      senderId === currentUserId ||
      senderId.toString() === currentUserId.toString();

    if (isCurrentUser) {
      return "You";
    } else {
      // If the sender isn't the current user, return their username
      return message.sender.username || "Unknown";
    }
  };

  return (
    <div className="messaging-app">
      <HeaderHomepage />
      <div className="app-content">
        <div className="conversation-sidebar">
          <div className="create-conversation">
            <button
              className="create-button"
              onClick={() => setShowNewConversation(!showNewConversation)}
            >
              + Create Conversation
            </button>

            {showNewConversation && (
              <div className="new-conversation-form">
                <div className="search-container" ref={dropdownRef}>
                  <input
                    type="text"
                    value={
                      typeof newConversationName === "object"
                        ? newConversationName.name
                        : newConversationName
                    }
                    onChange={handleSearchChange}
                    placeholder="Enter person or company name"
                  />

                  {showDropdown && (
                    <div className="search-dropdown">
                      {isSearching ? (
                        <div className="searching">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        <ul>
                          {searchResults.map((user) => (
                            <li
                              key={user._id}
                              onClick={() => handleSelectUser(user)}
                            >
                              <div className="search-result-item">
                                {user.profileDetails.profileImg && (
                                  <img
                                    src={user.profileDetails.profileImg}
                                    alt="Profile"
                                    className="search-profile-img"
                                  />
                                )}
                                <div className="search-user-details">
                                  <span className="search-user-name">
                                    {user.profileDetails.firstName}{" "}
                                    {user.profileDetails.lastName}
                                  </span>
                                  {user.role === "student" && user.bestTag && (
                                    <span className="user-tag">
                                      {user.bestTag}
                                    </span>
                                  )}
                                  {user.role === "employer" &&
                                    user.profileDetails.companyName && (
                                      <span className="company-name">
                                        {user.profileDetails.companyName}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="no-results">No users found</div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={handleCreateConversation}>Create</button>
              </div>
            )}
          </div>

          <div className="conversation-list">
            {isLoading ? (
              <div className="loading">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">No conversations yet</div>
            ) : (
              conversations.map((convo) => {
                // Get the other participant (not current user)
                const otherParticipant = getOtherParticipant(convo);

                // Find the current user's participant object to get the unread count
                const currentUserParticipant = convo.participants.find((p) => {
                  const participantId = p.userId._id || p.userId;
                  return (
                    participantId === currentUserId ||
                    participantId.toString() === currentUserId.toString()
                  );
                });

                const unreadCount = currentUserParticipant?.unreadCount || 0;

                // Get conversation display name (the other person's name)
                const conversationName =
                  otherParticipant?.username || "Unknown";
                return (
                  <div
                    key={convo._id}
                    className={`conversation-item ${
                      activeConversationId === convo._id ? "active" : ""
                    }`}
                    onClick={() => setActiveConversationId(convo._id)}
                  >
                    <div className="sender-info">
                      <h3>{conversationName}</h3>
                      <p className="message-preview">
                        {convo.lastMessage
                          ? // Check who sent the last message and display accordingly
                            (() => {
                              const lastMessageSender =
                                convo.lastMessage.sender._id ||
                                convo.lastMessage.sender;
                              const wasCurrentUser =
                                lastMessageSender === currentUserId ||
                                lastMessageSender.toString() ===
                                  currentUserId.toString();
                              return `${
                                wasCurrentUser
                                  ? "You: "
                                  : `${conversationName}: `
                              }${convo.lastMessage.content}`;
                            })()
                          : "No messages"}
                      </p>
                    </div>
                    <div className="message-meta">
                      <span className="time">
                        {convo.lastMessage
                          ? formatMessageDate(convo.lastMessage.createdAt)
                          : ""}
                      </span>
                      {unreadCount > 0 && (
                        <span className="unread-count">{unreadCount}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="message-view">
          {activeConversationId && activeConversation ? (
            <>
              <div className="message-header">
                <div className="conversation-profile">
                  <div className="profile-avatar">
                    {getOtherParticipant(activeConversation)?.username?.charAt(
                      0
                    ) || "?"}
                  </div>
                  <div className="profile-info">
                    <h2>
                      {getOtherParticipant(activeConversation)?.username ||
                        "Unknown"}
                    </h2>
                    <p className="last-seen">
                      {getOtherParticipant(activeConversation)?.lastSeen
                        ? formatLastSeen(
                            getOtherParticipant(activeConversation).lastSeen
                          )
                        : "Never seen"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <p className="start-conversation">
                      Start the conversation with{" "}
                      {getOtherParticipant(activeConversation)?.username}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="message-date-header">
                      <span>Today</span>
                    </div>
                    {messages.map((msg) => {
                      // Fix: Check if sender is an object with _id or a direct ID
                      const senderId = msg.sender._id || msg.sender;
                      const isCurrentUser =
                        senderId === currentUserId ||
                        senderId.toString() === currentUserId.toString();
                      const senderName = isCurrentUser
                        ? "You"
                        : msg.sender.username || "sUnknown";
                      return (
                        <div
                          key={msg._id}
                          className={`message-wrapper ${
                            isCurrentUser ? "sent-wrapper" : "received-wrapper"
                          }`}
                        >
                          <div
                            className={`message ${
                              isCurrentUser
                                ? "message-sent"
                                : "message-received"
                            }`}
                          >
                            {!isCurrentUser && (
                              <span className="message-sender">
                                {senderName}
                              </span>
                            )}
                            <p className="message-content">{msg.content}</p>
                            <span className="message-time">
                              {formatMessageDate(msg.createdAt)}
                              {isCurrentUser &&
                                msg.readBy &&
                                msg.readBy.length > 1 && (
                                  <span className="read-status">Read</span>
                                )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send a message`}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="no-conversation-content">
                <div className="empty-state-icon">💬</div>
                <h3>Your messages</h3>
                <p>
                  Select a conversation or create a new one to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inboxpage;
