import { motion } from 'framer-motion';
import React from 'react'
import './studentlandpage.css'
import Header from '../../common/studempheader';
import Footer from '../../common/footer'
import profile from '../../../assets/reviewericon.png';

function studentlandpage() {
  return (
    <div className='studentlandpage'>
        <Header />
        <section className='welcome-section'>
         <motion.div className="div"
            initial={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
                duration: 0.6, // Smooth animation duration
                ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
            }}
            viewport={{ once: true, amount: 0.1 }} // Trigger animation when slightly in view
         >
         <h1>Welcome to TUPath</h1>
         <p>Start your journey towards a successful career by building a standout academic portfolio.</p>
         </motion.div>
        </section>

        <motion.section className="academic-pathway-container"
        initial={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
            duration: 0.6, // Smooth animation duration
            ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
        }}
        viewport={{ once: true, amount: 0.1 }} // Trigger animation when slightly in view
        >
          <div className='subsec'>
              <div className='subsubsec'>
                  <div className="image-container">
                </div>
                <div className="text-container">
                  <h6>Unlock Your Academic Potential</h6>
                  <h2>Your Pathway to Academic Excellence</h2>
                  <p>TUPath empowers students to create standout academic profiles that showcase their unique skills and achievements. 
                    Simplify the process of uploading and organizing your accomplishments, while leveraging AI-driven insights to identify 
                    strengths and areas for growth. Through AI-generated questionnaires, 
                    students can gain insights into their strengths and areas for 
                    improvement, enhancing their employability
                  </p>
                </div>
              </div>
              <div className='subsubsec'>

                  <div className="image-container1">
                </div>
                <div className="text-container">
                <h6>Showcase Your Academic Journey</h6>
                <h2>Empowering Students for Future Success</h2>
                <p>Use TUPath to effectively present your academic achievements in a professional and engaging way. Build a comprehensive profile 
                  that reflects your skills and experience, making a strong impression on potential employers. Gain valuable insights through 
                  AI-generated tools to refine your strengths and prepare for career opportunities.
                </p>
              </div>
           </div>
          </div>
         </motion.section>

      

        <motion.section className="testimonial-container"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          viewport={{ once: true, amount: 0.2 }}  
        >
          <div className="stars">
            {Array(5).fill().map((_, i) => (
              <span key={i} className="star">★</span>
            ))}
          </div>
          <p className="testimonial-text">
            Using TUPATH has been a game-changer in managing my academic portfolio. The platform's intuitive design and AI-driven insights have opened doors to numerous job opportunities.
          </p>
          <div className="testimonial-user">
            <img
              src={profile} // Replace with the actual image path
              alt="Jordan Smith"
              className="user-image"
            />
            <div className="user-info">
              <h4>Jordan Smith</h4>
              <p>Computer Science Graduate</p>
            </div>
          </div>
        </motion.section>

        <motion.section className="academic-pathway-container2"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          viewport={{ once: true, amount: 0.2 }}  
        >
          <div className='subsubsec2'>
            <div className="text-container2">
                <h2>Your Path to Success</h2>
                <p>Follow these simple steps to create a compelling academic profile that attracts top employers
                </p>
              </div>
                <div className="image-container2">
              </div>
            </div>
         </motion.section>

         <motion.section className="steps-section-container"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            viewport={{ once: true, amount: 0.2 }}     
         >
          <div className="steps-container">
            <div className="step">
              <div>
                 <div className="step-number">01</div>
              </div>
              <h3>Create Your Profile</h3>
              <p>
                Start by setting up your personalized profile to showcase your academic journey.
              </p>
            </div>
            <div className="step">
              <div>
                 <div className="step-number">02</div>
              </div>
              <h3>Upload Your Documents</h3>
              <p>
                Easily upload transcripts, certificates, and other important documents.
              </p>
            </div>
            <div className="step">
                <div>
                 <div className="step-number">03</div>
              </div> 
              <h3>Answer Questions</h3>
              <p>
                Enhance your profile by answering system indicators tailored to highlight your strengths.
              </p>
            </div>
          </div>
          <div className="call-to-action">
            <div className='call-to-action-sub'>
            <h2>Start Building Your Future</h2>
            <p>Join TUPATH today and take the first step towards your career goals.</p>
            </div>
            <a href="/studentsignup"><button className="cta-button">Create Your Profile</button></a>
          </div>
       </motion.section>
         

        <Footer />

    </div> 
  )
}

export default studentlandpage