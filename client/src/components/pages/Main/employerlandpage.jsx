import React from 'react'
import './employerlandpage.css'
import Header from '../../common/header';
import Footer from '../../common/footer';
import search from '../../../assets/search.png';
import rank from '../../../assets/ranking.png';
import insights from '../../../assets/insigths.png';
import profile from '../../../assets/reviewericon.png';




function employerlandpage() {
  return (
    <div className='employerlandpage'>
    <Header />
    
      <section className='employer-welcome-section'>
         <div className='emplyer-welcome-subsection'>
            <h1>Discover Top Talent with TUPath</h1>
            <p>Streamline your recruitment process by accessing accurated pool of highly skilled students.</p>
         </div>

         <section className='discover-section'>
          <div className="discover-container">
              <div className="discover-sub-container">
                <div>
                    <div className="discover-box"><img src={search}></img></div>
                </div>
              <div className='subbox'>
                <h3>Advanced Search</h3>
                <p>
                   Utilize our powerful search tools to find candidates that match your specific needs.
                </p>
              </div>
              </div>

              
              <div className="discover-sub-container">
                <div>
                    <div className="discover-box"><img src={rank}></img></div>

                </div>
                <div className='subbox'>
                  <h3>Dynamic Rankings</h3>
                  <p>View candidates ranked by skills and experience to make informed hiring decisions.</p>
                </div>
                
              </div>
              <div className="discover-sub-container">
                  <div>
                  <div className="discover-box"><img src={insights}></img></div>

                </div> 
                <div className='subbox'>
                <h3>AI Insights</h3>
                <p>
                   Leverage AI-generated insights to understand candidate potential and fit.
                </p>
                </div>
              </div>
            </div>
            </section>
          </section>

          <section className="talent-section">
          <div className="talent-content">
            <h2>Efficient Talent Acquisition</h2>
            <div className="talent-cards">
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-id-badge"></i> {/* Icon can be from FontAwesome */}
                </div>
                <h3>Comprehensive Profiles</h3>
                <p>Access detailed profiles showcasing academic achievements and skills.</p>
              </div>
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-filter"></i>
                </div>
                <h3>Customizable Filters</h3>
                <p>Filter candidates by various criteria to find the perfect match.</p>
              </div>
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-bell"></i>
                </div>
                <h3>Real-Time Updates</h3>
                <p>Receive instant notifications on new candidate matches.</p>
              </div>
              <div className="talent-card">
                <div className="icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <h3>Seamless Integration</h3>
                <p>Integrate TUPATH with your existing HR systems for a smooth workflow.</p>
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

          
   

    <Footer />
    
    </div>
  )
}

export default employerlandpage