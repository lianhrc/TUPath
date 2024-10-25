import React from 'react'
import '../Landingpages/studentlandpage.css'
import Header from '../components/header';
import Footer from '../components/footer'
import profile from '../assets/reviewericon.png';



function studentlandpage() {
  return (
    <div className='studentlandpage'>
        <Header />
        <section className='welcome-section'>
          <h1>Welcome to TUPath</h1>
          <p>Start your journey towards a successful career by building a standout academic portfolio.</p>
        </section>

        <section className="academic-pathway-container">
          <div className='subsec'>
              <div className='subsubsec'>
                  <div className="image-container">
                </div>
                <div className="text-container">
                  <h6>Unlock Your Academic Potential</h6>
                  <h2>Your Pathway to Academic Excellence</h2>
                  <p>TUPATH empowers students to craft compelling academic 
                  profiles that highlight their unique skills and achievements.
                  Our platform simplifies the process of document management, 
                  enabling students to effortlessly upload and organize their 
                  academic accomplishments. Through AI-generated questionnaires, 
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
                <p>Utilize TUPATH to effectively manage and present your academic 
                achievements in a professional manner. Create a comprehensive 
                profile that highlights your skills and experiences, making you 
                stand out to potential employers. Take advantage of AI-generated 
                questionnaires to reflect on your strengths and areas for growth.
                </p>
              </div>
           </div>
          </div>
         </section>

      

        <section className="testimonial-container">
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
        </section>

        <section className="academic-pathway-container2">
          <div className='subsubsec2'>
            <div className="text-container2">
                <h2>Your Path to Success</h2>
                <p>Follow these simple steps to create a compelling academic profile that attracts top employers
                </p>
              </div>
                <div className="image-container2">
              </div>
            </div>
         </section>

         <section className="steps-section-container">
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
              <h3>Answer AI Questions</h3>
              <p>
                Enhance your profile by answering AI-generated questions tailored to highlight your strengths.
              </p>
            </div>
          </div>
          <div className="call-to-action">
            <div className='call-to-action-sub'>
            <h2>Start Building Your Future</h2>
            <p>Join TUPATH today and take the first step towards your career goals.</p>
            </div>
            <button className="cta-button">Create Your Profile</button>
          </div>
       </section>
         

        <Footer />

    </div> 
  )
}

export default studentlandpage