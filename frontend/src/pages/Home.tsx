import React, { useEffect } from "react";

function Home(){
    // Set title
    useEffect(() => {
        document.title = 'FinanceTracker';
      }, []);

      
    return (
        <>
            <h1>this is home.</h1>
        </> 
    )
}

export default Home;