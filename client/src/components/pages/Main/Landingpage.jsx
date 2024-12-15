import { motion } from 'framer-motion';
import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import profileicon from '../../../assets/profile.png';
import fileicon from '../../../assets/file.png';
import boticon from '../../../assets/bot.png';
import reviewericon from '../../../assets/reviewericon.png';
import Header from '../../common/header';
import Footer from '../../common/footer';
import './Landingpage.css';


const LandingPage = () => {


  const navigate = useNavigate();

  // Redirect to studenthomepage if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/homepage', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="landing-page">
    <Header />

      <motion.section className="hero-section"
      initial={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
          duration: 0.6, // Smooth animation duration
          ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
      }}
      viewport={{ once: true, amount: 0.1 }} // Trigger animation when slightly in view
      >
        <div className="hero-content">
          <p className='p1'>Empowering Students, Engaging Employers</p>
          <h1>Showcase Your Academic Journey</h1>
          <p className='p'>Discover TUPATH, the ultimate platform to manage and present your academic achievements, connecting you with opportunities and future employers.</p>
            <div className="hero-buttons">

              <a href="/Login"> <button className="get-started-btn">Get Started </button></a>
              <a href="/studentlandpage"><button className="explore-btn">Explore Features &#62;</button></a>
            </div>
        </div>
        <div className="hero-image">
         
        </div>
      </motion.section>

       <motion.section className="unleash-section"
       initial={{ opacity: 0, y: 100 }}
       whileInView={{ opacity: 1, y: 0 }}
       transition={{ type: "spring", stiffness: 100, damping: 10 }}
       viewport={{ once: true, amount: 0.2 }}
       
        >
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
        </motion.section>


      <motion.section class="tupath-join-section"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          viewport={{ once: true, amount: 0.2 }}  
          >
           <div class="tupath-content">
              <div class="tupath-content-left">
                <h1>Join TUPATH Today</h1>
                <p>Whether you're a student looking to stand out or an employer seeking top talent, TUPATH is your gateway to success.</p>
                  <div class="buttons">
                    <a href="/loginroles" className="btn-signup">Sign Up Now</a>
                    <a href="#" class="btn-learnmore">Learn More →</a>
                  </div>
              </div>
            <div class="tupath-content-right">
            </div>
           </div>
      </motion.section>


      <motion.section class="faq-section"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        viewport={{ once: true, amount: 0.2 }}
        >
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
      </motion.section>


      <Footer />

    </div>
  );
};


export default LandingPage;
