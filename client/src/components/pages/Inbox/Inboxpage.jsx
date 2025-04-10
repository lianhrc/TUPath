import React, { useState, useEffect, useRef } from "react";
import "./Inboxpage.css";
import HeaderHomepage from "../../common/headerhomepage";
import axiosInstance from "../../../services/axiosInstance";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function Inboxpage() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("userId") || "";

  // Fetch all conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/api/messaging/conversations");
        if (response.data.success) {
          const fetchedConversations = response.data.conversations;
          setConversations(fetchedConversations);
          
          // Set first conversation active if there are any and no active conversation
          if (fetchedConversations.length > 0 && !activeConversation) {
            setActiveConversation(fetchedConversations[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Socket listeners
    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTypingIndicator);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTypingIndicator);
    };
  }, []);

  // Handle incoming messages
  const handleNewMessage = ({ conversationId, message }) => {
    if (activeConversation?._id === conversationId) {
      setMessages(prev => [...prev, message]);
    }
    
    setConversations(prev => prev.map(conv => 
      conv._id === conversationId 
        ? { ...conv, lastMessage: message } 
        : conv
    ));
  };

  // Handle typing indicators
  const handleTypingIndicator = ({ conversationId, isTyping: typing, userId }) => {
    if (userId !== currentUserId && activeConversation?._id === conversationId) {
      setIsTyping(typing);
    }
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        const response = await axiosInstance.get(
          `/api/messaging/conversations/${activeConversation._id}/messages`
        );
        if (response.data.success) {
          setMessages(response.data.messages);
          socket.emit("join_conversation", activeConversation._id);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeConversation]);

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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 0) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search for users
  const handleSearch = async (query) => {
    if (query.length > 0) {
      setIsSearching(true);
      setShowDropdown(true);
      
      try {
        const response = await axiosInstance.get(
          `/api/messaging/search?query=${query}`
        );
        if (response.data.success) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
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

    // Create new conversation with selected user
    handleCreateConversation(user._id, displayName);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await axiosInstance.post("/api/messaging/messages", {
        conversationId: activeConversation._id,
        content: newMessage,
      });

      if (response.data.success) {
        const sentMessage = response.data.message;
        
        // Add new message to the UI
        setMessages(prev => [...prev, sentMessage]);
        
        // Update conversation's last message
        setConversations(prev => prev.map(conv => 
          conv._id === activeConversation._id 
            ? { ...conv, lastMessage: sentMessage } 
            : conv
        ));

        // Emit socket event
        socket.emit("send_message", {
          conversationId: activeConversation._id,
          message: sentMessage
        });

        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Emit typing event
    socket.emit("typing", {
      conversationId: activeConversation?._id,
      isTyping: true,
      userId: currentUserId
    });
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: activeConversation?._id,
        isTyping: false,
        userId: currentUserId
      });
    }, 2000);
  };

  // Create new conversation
  const handleCreateConversation = async (participantId, displayName) => {
    if (!participantId) return;

    try {
      const response = await axiosInstance.post(
        "/api/messaging/conversations",
        {
          participantId,
        }
      );

      if (response.data.success) {
        const newConvo = response.data.conversation;

        // Check if this is truly a new conversation
        if (
          !response.data.message ||
          response.data.message !== "Conversation already exists"
        ) {
          // Ensure the conversation has proper display information
          const enhancedConvo = {
            ...newConvo,
            displayName: displayName
          };

          setConversations(prev => [enhancedConvo, ...prev]);
          setActiveConversation(enhancedConvo);
        } else {
          // Find the existing conversation - FIX: Add proper null checking
          const existingConvo = conversations.find(c => 
            c.participants && c.participants.some(p => {
              if (!p || !p.userId) return false;
              const pId = p.userId._id || p.userId;
              return pId && participantId && pId.toString() === participantId.toString();
            })
          );
          
          if (existingConvo) {
            setActiveConversation(existingConvo);
          } else {
            // If not found in current list, add the returned conversation
            setConversations(prev => [newConvo, ...prev]);
            setActiveConversation(newConvo);
          }
        }

        // Reset search and form state
        setShowNewConversation(false);
        setSearchQuery("");
        setSearchResults([]);
        
        // Join the socket room
        socket.emit("join_conversation", newConvo._id);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Get the other participant in conversation
  const getOtherParticipant = (conversation) => {
    if (
      !conversation ||
      !conversation.participants ||
      !conversation.participants.length
    ) {
      return { username: "Unknown" };
    }

    // Improved participant finding with better logging
    const otherParticipant = conversation.participants.find(p => {
      if (!p || !p.userId) {
        console.log("Invalid participant:", p);
        return false;
      }
      
      // Check if userId is an object or just an ID string
      const participantId = typeof p.userId === 'object' ? p.userId._id : p.userId;
      
      if (!participantId || !currentUserId) {
        return false;
      }
      
      return participantId.toString() !== currentUserId.toString();
    });

    if (!otherParticipant || !otherParticipant.userId) {
      console.log("Could not find other participant in:", conversation.participants);
      return { username: "Unknown" };
    }

    // If userId is an object with user details
    if (typeof otherParticipant.userId === 'object') {
      const user = otherParticipant.userId;
      
      // Try to build a proper name from available fields
      if (user.profileDetails && (user.profileDetails.firstName || user.profileDetails.lastName)) {
        const firstName = user.profileDetails.firstName || '';
        const lastName = user.profileDetails.lastName || '';
        return {
          ...user,
          username: `${firstName} ${lastName}`.trim() || user.username || "Unknown"
        };
      }
      
      return user;
    }
    
    // If userId is just an ID string, return a placeholder
    return { username: "Contact" };
  };

  // Format message time
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                // First check if the conversation has a displayName property (direct property)
                let conversationName = convo.displayName || "Unknown";
                
                // Only try to get name from participants if we don't have a displayName
                if (conversationName === "Unknown") {
                  // Get the other participant name with better error handling
                  const otherParticipant = getOtherParticipant(convo);
                  
                  // Try to get display name from various sources
                  if (otherParticipant) {
                    if (otherParticipant.username) {
                      conversationName = otherParticipant.username;
                    } else if (otherParticipant.profileDetails) {
                      const pd = otherParticipant.profileDetails;
                      if (pd.firstName || pd.lastName) {
                        conversationName = `${pd.firstName || ''} ${pd.lastName || ''}`.trim();
                      } else if (pd.companyName) {
                        conversationName = pd.companyName;
                      }
                    }
                  }
                }
                
                // Log for debugging only if all attempts to find a name failed
                if (conversationName === "Unknown") {
                  console.log("Could not determine name for conversation:", convo);
                }

                // Find the current user's participant object to get unread count
                const currentUserParticipant = convo.participants && convo.participants.find((p) => {
                  if (!p || !p.userId) return false;
                  const participantId = p.userId._id || p.userId;
                  return participantId && currentUserId && 
                    participantId.toString() === currentUserId.toString();
                });

                const unreadCount = currentUserParticipant?.unreadCount || 0;

                return (
                  <div
                    key={convo._id}
                    className={`conversation-item ${
                      activeConversation?._id === convo._id ? "active" : ""
                    }`}
                    onClick={() => setActiveConversation(convo)}
                  >
                    <div className="sender-info">
                      <h3>{conversationName}</h3>
                      <p className="message-preview">
                        {convo.lastMessage
                          ? (() => {

                              const lastMessageSender =
                                convo.lastMessage.sender._id ||
                                convo.lastMessage.sender;
                              const wasCurrentUser =
                                lastMessageSender.toString() === currentUserId.toString();
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
          {activeConversation ? (
            <>
              <div className="message-header">
                <div className="conversation-profile">
                  <div className="profile-avatar">
                    {activeConversation.displayName ? 
                      activeConversation.displayName.charAt(0) : 
                      (getOtherParticipant(activeConversation)?.username?.charAt(0) || "?")}
                  </div>
                  <div className="profile-info">
                    <h2>
                      {activeConversation.displayName || 
                        getOtherParticipant(activeConversation)?.username ||
                        "Unknown"}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <p className="start-conversation">
                      Start the conversation with{" "}
                      {activeConversation.displayName || 
                        getOtherParticipant(activeConversation)?.username || 
                        "this contact"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="message-date-header">
                      <span>Today</span>
                    </div>
                    {messages.map((msg) => {
                      // Validate message format
                      if (!msg || !msg.sender) {
                        console.error("Invalid message format:", msg);
                        return null;
                      }
                      
                      // Determine if message is from current user
                      const senderId = msg.sender._id || msg.sender;
                      const isCurrentUser = senderId.toString() === currentUserId.toString();
                      const senderName = isCurrentUser
                        ? "You"
                        : msg.sender.username || "Unknown";
                        
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
                    {isTyping && (
                      <div className="typing-indicator">
                        <span>
                          {activeConversation.displayName || 
                            getOtherParticipant(activeConversation)?.username || 
                            "Someone"} is typing...
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
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
