import React, { useState, useEffect, useRef } from 'react';
import './Inboxpage.css';
import HeaderHomepage from '../../common/headerhomepage';
// Removed axiosInstance import

function Inboxpage() {
  const [activeTab, setActiveTab] = useState('Alex Johansen');
  const [conversations, setConversations] = useState([
    {
      id: '1',
      name: 'Alex Johansen',
      lastSeen: '10:30 AM',
      unread: false,
      messages: [
        {
          id: '101',
          sender: 'Alex Johansen',
          content: 'The speed tracking on the project was discussed.',
          time: '10:30 AM'
        }
      ]
    },
    {
      id: '2',
      name: 'Search Williams',
      lastSeen: 'Yesterday',
      unread: true,
      messages: [
        {
          id: '201',
          sender: 'Search Williams',
          content: 'Intelligent Spin tomorrow?',
          time: 'Yesterday'
        }
      ]
    },
    {
      id: '3',
      name: 'Login',
      lastSeen: 'Monday',
      unread: false,
      messages: [
        {
          id: '301',
          sender: 'Login',
          content: 'Molding at 3pm tomorrow?',
          time: 'Monday'
        }
      ]
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Mock user data for search results
  const mockUsers = [
    { _id: '1', profileDetails: { firstName: 'John', lastName: 'Doe' }, bestTag: 'Developer' },
    { _id: '2', profileDetails: { firstName: 'Jane', lastName: 'Smith' }, bestTag: 'Designer' },
    { _id: '3', profileDetails: { firstName: 'Mike', lastName: 'Johnson' }, bestTag: 'Project Manager' },
    { _id: '4', profileDetails: { firstName: 'Sarah', lastName: 'Williams' }, bestTag: 'Data Analyst' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setNewConversationName(query);
    
    if (query.length > 0) {
      setShowDropdown(true);
      
      // Filter mock users locally instead of API call
      const filteredResults = mockUsers.filter(user => 
        `${user.profileDetails.firstName} ${user.profileDetails.lastName}`.toLowerCase().includes(query)
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Handle user selection from dropdown
  const handleSelectUser = (user) => {
    const fullName = `${user.profileDetails.firstName} ${user.profileDetails.lastName}`;
    setNewConversationName(fullName);
    setShowDropdown(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const updatedConversations = conversations.map(convo => {
        if (convo.name === activeTab) {
          return {
            ...convo,
            lastSeen: 'Just now',
            messages: [
              ...convo.messages,
              {
                id: Date.now().toString(),
                sender: 'You',
                content: newMessage,
                time: 'Just now'
              }
            ]
          };
        }
        return convo;
      });
      
      setConversations(updatedConversations);
      setNewMessage('');
    }
  };

  const handleCreateConversation = () => {
    if (newConversationName.trim()) {
      const newConvo = {
        id: Date.now().toString(),
        name: newConversationName,
        lastSeen: 'Just now',
        unread: false,
        messages: [
          {
            id: Date.now().toString() + '-msg',
            sender: 'System',
            content: 'New conversation started',
            time: 'Just now'
          }
        ]
      };
      
      setConversations([...conversations, newConvo]);
      setNewConversationName('');
      setShowNewConversation(false);
      setActiveTab(newConversationName);
    }
  };
  
  const activeConversation = conversations.find(convo => convo.name === activeTab);

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
                    value={newConversationName}
                    onChange={handleSearchChange}
                    placeholder="Enter person's name"
                  />
                  
                  {showDropdown && (
                    <div className="search-dropdown">
                      {searchResults.length > 0 ? (
                        <ul>
                          {searchResults.map((user) => (
                            <li 
                              key={user._id} 
                              onClick={() => handleSelectUser(user)}
                            >
                              {user.profileDetails.firstName} {user.profileDetails.lastName}
                              {user.bestTag && <span className="user-tag"> - {user.bestTag}</span>}
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
            {conversations.map((convo) => (
              <div 
                key={convo.id}
                className={`conversation-item ${activeTab === convo.name ? 'active' : ''}`}
                onClick={() => setActiveTab(convo.name)}
              >
                <div className="sender-info">
                  <h3>{convo.name}</h3>
                  <p className="message-preview">
                    {convo.messages[convo.messages.length - 1]?.content || 'No messages'}
                  </p>
                </div>
                <div className="message-meta">
                  <span className="time">{convo.lastSeen}</span>
                  {convo.unread && <span className="unread-dot"></span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="message-view">
          {activeConversation ? (
            <>
              <div className="message-header">
                <h2>{activeConversation.name}</h2>
                <p className="last-seen">Last seen {activeConversation.lastSeen}</p>
              </div>

              <div className="messages-container">
                {activeConversation.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.sender === 'You' ? 'message-sent' : 'message-received'}`}
                  >
                    <p className="message-content">{msg.content}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                ))}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
              <p>Select a conversation or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inboxpage;