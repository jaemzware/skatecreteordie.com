import '../App.css';
import React from "react";
function IosApp(props){
    return (
        <>
            <table>
                <th colSpan={"2"}>
                    <h1>skatecreteordie in the app store now!</h1>
                    <h1><a href={process.env.REACT_APP_APPLE_STORE_URL}>skatecreteordie for iOS</a></h1>
                    <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}southpark.gif`} alt={"animated southpark session"} />
                </th>
                <tr>
                    <td className="left"><img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.appstore.PNG`}
                             alt="#skatecreteordie in app store"/></td>
                    <td className="left"></td>
                </tr>
                <tr>
                    <td className="left">
                        <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.pins.PNG`}
                                              alt="skatecreteordie park pins"/>
                    </td>
                    <td className="left">
                        <h1>skatecreteordie does not save nor share data and requires no registration</h1>
                        <h1>find parks close to your current location</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.pin.PNG`}
                             alt="katecreteordie park pin"/>
                    </td>
                    <td className="left">
                        <h1>extremely accurate, centered park geo-coordinates</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.path.PNG`}
                             alt="skatecreteordie path screen"/>
                    </td>
                    <td className="left">
                        <h1>trace your path with a small <span className="lime-green">lime-green</span>line</h1>
                        <h1>the coordinates of your current location shown are <b>not sent nor shared</b> anywhere.</h1>
                        <h1>the path is most accurate with excellent data coverage.</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}marginalpromo.jpg`}
                             alt="skatecreteordie details screen"/>
                    </td>
                    <td className="left">
                        <h1>park details</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.list.PNG`}
                             alt="skatecreteordie list screen"/>
                    </td>
                    <td className="left">
                        <h1>park listing</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.privacy.PNG`}
                             alt="skatecreteordie privacy in settings"/>
                    </td>
                    <td className="left">
                        <h1>privacy settings</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img
                            src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.locationservices.PNG`}
                            alt="skatecreteordie in location services"/>
                    </td>
                    <td className="left">
                        <h1>location services</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img
                            src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.skatecreteordielocationservices.PNG`}
                            alt="skatecreteordie location services"/>
                    </td>
                    <td className="left">
                        <h1>skatecreteordie location services</h1>
                    </td>
                </tr>
                <tr>
                    <td className="left">
                        <img
                            src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordie.com.skatecreteordiealways.PNG`}
                            alt="skatecreteordie set to always"/>
                    </td>
                    <td className="left">
                        <h1>set to always allow for path tracking</h1>
                        <h1>with precise location</h1>
                    </td>
                </tr>
            </table>
        </>
    );
}

export default IosApp;