import React from "react";
import '../App.css';
import AppStoreButtons from "./AppStoreButtons"


function Footer(props) {
    return (
        <footer className="app-footer">
            <nav>
                <a href="#" onClick={() => props.setShowPage("MAP")}>Map</a>
                <a href="#" onClick={() => props.setShowPage("LIST")}>List</a>
                <a href="#" onClick={() => props.setShowPage("SUBMISSION")}>Submission</a>
                <a href="#" onClick={() => props.setShowPage("WELCOME")}>Welcome</a>
                <a href="#" onClick={() => props.setShowPage("IOS")}>iOS</a>
                <a href="#" onClick={() => props.setShowPage("ANDROID")}>Android</a>
                <a href={process.env.REACT_APP_PRIVACY_POLICY_URL}>Privacy</a>
            </nav>
            <AppStoreButtons />
        </footer>
    );
}

export default Footer;