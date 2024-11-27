import '../App.css';
import React from "react";
function AndroidApp(props){
    return (
        <>
            <table>
                <th colSpan={"2"}>
                    <h1>skate.crete.or.die in the play store now!</h1>
                    <h1><a href={process.env.REACT_APP_PLAY_STORE_URL}>skate.crete.or.die for Android</a></h1>
                    <img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordieandroid.gif`} alt="animated android demo" />
                </th>
                <tr>
                    <td className="left"><img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}androidv7.jpg`} alt="google play beta" /></td>
                    <td className="left"></td>
                </tr>

                <tr>

                    <td className="left"><img src={`${process.env.REACT_APP_IMAGE_SERVER_URL}googleplaybeta.jpg`}
                                              alt="#skate.crete.or.die in google play store"/></td>
                    <td className="left"></td>
                </tr>
            </table>
        </>
    );
}

export default AndroidApp;