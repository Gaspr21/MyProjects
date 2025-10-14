import React from "react";
import './style/error.css'

function ErrorPrompt({message} : {message : any}) {

    return(
        <>
        {console.log(message)}
        <div className="errorPrompt">
            <div className="errorMessage">!!! Something went wrong !!!</div>
        </div>
        </>
    )
}

export default ErrorPrompt