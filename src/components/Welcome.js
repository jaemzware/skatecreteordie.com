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
            <h1>Skatepark Map w/ photos and precise coordinates (tap truck).</h1>
            <h2>Download app for best experience.</h2>
            <AppStoreButtons />
            <h2>skatecreteordie for iOS, including all skatepark data is <a href={process.env.REACT_APP_GITHUB_URL} target="_blank"><b>Open source</b></a></h2>
            <div className="welcome-text">
                <p>
                    As a passionate skateboarder of 37 years, I have developed Skate Crete or Die as a strictly DIY project for iOS (skatecreteordie), Android (skate.crete.or.die), and web (https://skatecreteordie.com).
                </p>
                <p>
                    My goal is to inspire skateboarders worldwide by showcasing the incredible world-class skateparks in their own backyards, encouraging them to enjoy the healthy activity of skateboarding and engage with the skateboarding community.
                </p>
                <p>
                    The project is my contribution to the skateboarding community, reflecting my deep appreciation for the art of skateparks created by the master artisan builders featured.
                </p>
                <p>
                    I have personally funded, developed, and administered the entire project. I have never accepted any proceeds for this project. The apps and website are completely free, require no registration (not even an email address), and have no in-app purchases or advertising.
                </p>
                <p>
                    Each pin on Skate Crete or Die has been verified to be within the physical boundaries of the skatepark. Directions are programmed to lead the user directly to those precise geocoordinates. Often, skateparks don't have an exact street address, so using geocoordinates guarantees arrival at the park, allowing users to start skating immediately instead of searching around the neighborhood for the actual 'crete after arriving at the nearest address.
                </p>
                <p>
                    skate.crete.or.die for Android and skatecreteordie for iOS include a tracking feature that enables skaters to track their lines through the skatepark. This feature allows them to share their routes with friends or keep track of the features they've been skating the most. The tracking feature is especially helpful in large parks if your goal is to challenge yourself with all the available features; you can easily identify which features still require more of your skate time. Speaking of time, the tracking feature records the elapsed time from when you activate it. It also keeps track of your distance traveled in both miles and kilometers. Effectively, you can set personal distance goals and records while skating, pushing yourself to new limits.
                </p>
                <p className="invisible-text">
                    {props.pageCount}
                </p>
            </div>
        </div>
    );
}

export default Welcome;