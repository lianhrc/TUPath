import React from 'react';
import './Landingpage.css';
import logo from './assets/logoicon.png';
import portimg from './assets/portimg.png'; // Adjust the path as necessary
import rightarrow from './assets/right-arrow.png';
import profileicon from './assets/profile.png';
import fileicon from './assets/file.png';
import boticon from './assets/bot.png';
import reviewericon from './assets/reviewericon.png';


const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="navbar">
       <img src={logo} alt="Tupath Logo" className="logo" />
       
        <div className="auth-buttons">
            <nav className="nav-links">
                <a href="/">For Students</a>
                <a href="/">For Employers</a>
            </nav>
          <button className="login-btn">Login</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
        <p className='p1'>Empowering Students, Engaging Employers</p>
        <h1>Showcase Your Academic Journey</h1>
        <p className='p'>Discover TUPATH, the ultimate platform to manage and present your academic achievements, connecting you with opportunities and future employers.</p>
          <div className="hero-buttons">
            <button className="get-started-btn">Get Started</button>
            <button className="explore-btn">Explore Features <img src={rightarrow} alt="Tupath Logo" className="logo" /></button>
          </div>
        </div>
        <div className="hero-image">
        <img src={portimg} alt="Academic Showcase" /> {/* Use your imported image here */}
        </div>
      </section>

     

       <section className="unleash-section">
          <div className="unleash-top">
            <div className="column">
              <h2>Unleash Your Potential</h2>
              <p>
                TUPATH offers a suite of tools to help students create compelling
                profiles, upload achievements, and leverage AI-driven insights.
              </p>
            </div>
          </div>
          <div className="unleash-mid">
            <div className="box box1">
              <div className="boxtop">
                <img src={profileicon} alt="Profile Creation Icon" />
              </div>
              <div className="boxmid">
                <h5>Profile Creation</h5>
              </div>
              <div className="boxbottom">
                <p>
                  Craft a standout academic profile that highlights your unique skills
                  and experiences.
                </p>
              </div>
            </div>
            <div className="box box2">
              <div className="boxtop">
                <img src={fileicon} alt="Document Uploads Icon" />
              </div>
              <div className="boxmid">
                <h5>Document Uploads</h5>
              </div>
              <div className="boxbottom">
                <p>
                  Easily upload and organize your academic documents and certifications.
                </p>
              </div>
            </div>
            <div className="box box3">
              <div className="boxtop">
                <img src={boticon} alt="Dynamic Form Icon" />
              </div>
              <div className="boxmid2">
                <h5>Dynamic <span><br></br></span> Form Questionnaires</h5>
              </div>
              <div className="boxbottom">
                <p>
                  Receive personalized insights and recommendations through generated
                  questionnaires.
                </p>
              </div>
            </div>
          </div>

              <div className="unleash-bottom">
                  <div className="bottom-left">
                    <img src={reviewericon} alt="Dynamic Form Icon" />

                  </div>
                    <div className="bottom-right">
                      <p>TUPATH revolutionized the way I present my academic achievements. It's intuitive and has significantly increased my visibility to potential employers.</p>
                      <h6>Pedro Pepito</h6>
                      <p>TUP HR</p>
                    </div>
              </div>
        </section>


      <section class="tupath-join-section">
           <div class="tupath-content">
              <div class="tupath-content-left">
                <h1>Join TUPATH Today</h1>
                <p>Whether you're a student looking to stand out or an employer seeking top talent, TUPATH is your gateway to success.</p>
                  <div class="buttons">
                    <a href="#" class="btn-signup">Sign Up Now</a>
                    <a href="#" class="btn-learnmore">Learn More →</a>
                  </div>
              </div>
            <div class="tupath-content-right">
            </div>
           </div>
        
      </section>


      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about using TUPATH for managing your academic portfolio.</p>
        
        <div class="faq-items">
          <div class="faq-item">
            <div class="faq-icon">❓</div>
            <div class="faq-content">
              <h3>How do I create a profile?</h3>
              <p>Simply sign up and follow the guided steps to create and personalize your academic profile.</p>
            </div>
          </div>
          
          <div class="faq-item">
            <div class="faq-icon">❓</div>
            <div class="faq-content">
              <h3>Is my data secure?</h3>
              <p>Yes, we prioritize your privacy and ensure all data is securely stored and managed.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-icon">❓</div>
            <div class="faq-content">
              <h3>Can employers view my documents?</h3>
              <p>Employers can view the documents you choose to share publicly on your profile.</p>
            </div>
          </div>
          
          <div class="faq-item">
            <div class="faq-icon">❓</div>
            <div class="faq-content">
              <h3>How do I get support?</h3>
              <p>Our support team is available 24/7 to assist you with any questions or issues.</p>
            </div>
          </div>
        </div>
      </section>


      <footer class="site-footer">
        <div class="footer-links">
          <a href="#">About TUPATH</a>
          <a href="#">Student Support</a>
          <a href="#">Employer Solutions</a>
          <a href="#">Contact Us</a>
        </div>
        <hr />
        <div class="footer-copyright">
          <p>© TUPATH 2024, Empowering Academic Excellence</p>
        </div>
      </footer>
    

    </div>
  );
};


export default LandingPage;
