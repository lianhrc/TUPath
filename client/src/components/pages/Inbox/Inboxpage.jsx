import React, { useState } from 'react';
import HeaderHomepage from '../../common/headerhomepage';
import addnewwrite from '../../../assets/writemessage.png';
import dotsicon from '../../../assets/dots.png';
import profileicon from '../../../assets/profile2.png';
import profileicon2 from '../../../assets/profileicon.png';
import './Inboxpage.css';

function Inboxpage() {
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Define messages with profile images
  const messages = [
    { id: 1, name: 'Ernesto Kapitagan', date: 'oct 24', text: 'Are you in or out?', profileImage: profileicon },
    { id: 2, name: 'Pedro Mabola', date: 'oct 25', text: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.', profileImage: profileicon2 },
    { id: 3, name: 'Lauro Pilantik', date: 'oct 26', text: 'When do you free?', profileImage: profileicon },
    // Add more messages as needed
  ];

  // Function to handle message selection
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
  };

  return (
    <div className='Inboxpage'>
      <HeaderHomepage />
      <div className="inbox-container">
        <div className="inboxhead">
          <div className="headtitle">
            <p>Messaging</p>
          </div>
          <div className="headicons">
            <button>
              <img src={dotsicon} alt="More options" />
            </button>
            <button>
              <img src={addnewwrite} alt="Add new message" />
            </button>
          </div>
        </div>
        <div className="inboxmain">
          <div className="inboxmain-left">
            <div className="inboxlists">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="inboxlist-container"
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="inboxprofilecontainerleft">
                    <img src={message.profileImage} alt={`${message.name}'s profile`} />
                  </div>
                  <div className="inboxdetailscontainerright">
                    <div className="topdetailscontainer">
                      <h5>{message.name}</h5>
                      <p>{message.date}</p>
                    </div>
                    <div className="bottomdetailscontainer">
                      <p>{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="inboxmain-right">
            {selectedMessage ? (
              <div className="message-details">
                <div className="message-profile">
                   <img src={selectedMessage.profileImage} alt={`${selectedMessage.name}'s profile`} className="profile-image" />
                </div>
                  <div className="namedatecontainer">
                    <h4>{selectedMessage.name}</h4>
                    <p className="message-date">{selectedMessage.date}</p>
                  </div>
                <p className="message-content">{selectedMessage.text}</p>
              </div>
            ) : (
              <p>Select a message to view its content</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inboxpage;
