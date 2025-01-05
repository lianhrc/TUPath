import { motion } from 'framer-motion';
import React from 'react'
import './employerlandpage.css'
import Header from '../../common/studempheader';
import Footer from '../../common/footer';
import search from '../../../assets/search.png';
import rank from '../../../assets/ranking.png';
import insights from '../../../assets/insigths.png';
import profile from '../../../assets/reviewericon.png';


function employerlandpage() {
  return (
    <div className='employerlandpage'>
    <Header />
    
      <section className='employer-welcome-section' >
         <motion.div className='emplyer-welcome-subsection'

            initial={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
                duration: 0.6, // Smooth animation duration
                ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
            }}
            viewport={{ once: true, amount: 0.1 }} // Trigger animation when slightly in view
         >
            <h1>Discover Top Talent with TUPath</h1>
            <p>Streamline your recruitment process by accessing accurated pool of highly skilled students.</p>
         </motion.div>

         <motion.section className='discover-section'
            initial={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
                duration: 0.6, // Smooth animation duration
                ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
            }}
            viewport={{ once: true, amount: 0.1 }} // Trigger animation when slightly in view
         >
          <div className="discover-container">
              <div className="discover-sub-container">
                <div>
                    <div className="discover-box"><img src={search}></img></div>
                </div>
              <div className='subbox'>
                <h3>Advanced Search</h3>
                <p>
                  Find the perfect candidates using tailored search tools that match your hiring criteria.
                </p>
              </div>
              </div>

              
              <div className="discover-sub-container">
                <div>
                    <div className="discover-box"><img src={rank}></img></div>

                </div>
                <div className='subbox'>
                  <h3>Dynamic Rankings</h3>
                  <p>Access ranked candidate profiles based on skills, experience, and suitability.</p>
                </div>
                
              </div>
              <div className="discover-sub-container">
                  <div>
                  <div className="discover-box"><img src={insights}></img></div>

                </div> 
                <div className='subbox'>
                <h3>Insights</h3>
                <p>
                  Utilize analytics to evaluate candidate potential and make informed decisions.
                </p>
                </div>
              </div>
            </div>
            </motion.section>
          </section>

          <motion.section className="talent-section"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            viewport={{ once: true, amount: 0.2 }} 
          >
          <div className="talent-content">
            <h2>Efficient Talent Acquisition</h2>
            <div className="talent-cards">
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-id-badge"></i> {/* Icon can be from FontAwesome */}
                </div>
                <h3>Comprehensive Profiles</h3>
                <p>Explore detailed academic achievements, skills, and experience.</p>
              </div>
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-filter"></i>
                </div>
                <h3>Customizable Filters</h3>
                <p>Refine your search using advanced filters to identify the ideal candidates.</p>
              </div>
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-bell"></i>
                </div>
                <h3>Real-Time Updates</h3>
                <p>Stay informed with instant notifications about candidate matches.</p>
              </div>
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <h3>Seamless Integration</h3>
                <p>Connect TUPATH with your existing HR systems for a smooth workflow.</p>
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

          
   

    <Footer />
    
    </div>
  )
}

export default employerlandpage