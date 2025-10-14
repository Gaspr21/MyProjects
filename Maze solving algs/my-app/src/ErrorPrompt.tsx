import React from "react";
import './style/error.css'

function ErrorPrompt({message} : {message : any}) {

    return(
        <>
        {console.log(message)}
        <div className="errorPrompt">
            !!! WRONG !!!
        </div>
        </>
    )
}

export default ErrorPrompt