import React from 'react'
import './Home.css'

function Home() {
  return (
    <div>
    
        <header>
            <div className='lefthead'>TUPath Logo</div>
            <div className='centerhead'>
               
            </div>
            <div className='righthead'>
                <button className='loginbtn'>Login</button>
                <button className='signupbtn'>Sign up</button>
            </div>
        </header>
        <main>
            <div className='leftmain'> 
                <div className='leftmaincontent'>
                    <div className='leftmaincontenttop'>TUP STUDENTS</div>
                    <div className='leftmaincontentmid'></div>
                    <div className='leftmaincontentbottom'>
                        <button>
                            Get Started
                        </button>
                    </div>
                </div>
            </div>     
            <div className='rightmain'> </div>     
        
        </main>
        <footer>
        
        </footer>
    </div>
  )
}

export default Home
