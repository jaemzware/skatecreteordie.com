import '../App.css';
import AppStoreButtons from "./AppStoreButtons"

function Welcome(props) {
    return (
        <div className="welcome-container">
            <a href="#" onClick={() => props.setShowPage("MAP")}>
            <img
                className="welcome-logo"
                src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordiedeck.png`}
                alt="skatecreteordie deck logo"
            />
            </a>
            <h1>Skatepark Map</h1>
            <h1>(tap truck)</h1>
            <h2>Download app for best experience.</h2>
            <AppStoreButtons />
            <h2></h2>
            <div className="welcome-text">
                <p>
                    precisely find a good skatepark near you
                </p>
                <p>
                    track your lines
                </p>
                <p>
                    free, ad free, registration free
                </p>
                <p>
                    volunteers wanted. contributions, donations greatly accepted.
                </p>
                <p>
                    <a href={process.env.REACT_APP_GITHUB_URL} target="_blank"><b>open source - readme/quick start</b></a>
                </p>
                <p className="invisible-text">
                    {props.pageCount}
                </p>
            </div>
        </div>
    );
}

export default Welcome;