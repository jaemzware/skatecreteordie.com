import '../App.css';
import React, {useEffect} from 'react';
import { useState }  from 'react';
import SkateparkListing from "./SkateparkListing";
import AdvancedMapComponent from "./AdvancedMapComponent";
import Footer from "./Footer";
import IosApp from "./IosApp";
import SkateparkInputForm from "./SkateparkInputForm";
import AndroidApp from "./AndroidApp";
import Welcome from "./Welcome";
import Donate from "./Donate";
import { APIProvider } from '@vis.gl/react-google-maps';


function HomePage(props){
    const [showPage, setShowPage] = useState("WELCOME");
    const [fileListingArray, setFileListingArray] = useState([]);
    const [pageCount, setPageCount] = useState(null);

    const urlParams = new URLSearchParams(window.location.search);
    const parkId = urlParams.get('parkId');

    const handlePageChange = (page) => {
        setShowPage(page);

        // Clear the parkId parameter when navigating to other pages
        if (page !== "MAP") {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    useEffect(() => {
        fetch(process.env.REACT_APP_SKATEPARK_API_URL)
            .then((res => {
                const resJson = res.json();
                const errorStatus = res.status;
                if (errorStatus === 200) {
                    return resJson;
                } else {
                    throw new Error("SKATEPARK LISTING STATUS:" + errorStatus + " VIEW SERVER LOG FOR DETAILS");
                }
            }))
            .then(res => {
                let newParkListingArray = [];
                for (let i = 0; i < res.skateparks.length; i++) {
                    newParkListingArray.push(res.skateparks[i]);
                }
                setFileListingArray(newParkListingArray);
            })
            .catch(err => {
                console.error("FETCH COMMAND ERROR:" + err);
            });

        fetch(process.env.REACT_APP_COUNTER_API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok while incrementing page counter');
                }
                return response.json();
            })
            .then(data => {
                setPageCount(data.count);
            })
            .catch(error => {
                console.error('Error incrementing counter:', error);
            });

        if (parkId) {
            setShowPage("MAP");
        }
    }, [parkId]);

    if (showPage === "LIST"){
        return(
            <>
                <Footer setShowPage={handlePageChange} />
                <SkateparkListing fileListingArray={fileListingArray}/>
                <Footer setShowPage={handlePageChange} />
            </>
        )
    }
    else if(showPage === "IOS") {
        return(
            <>
                <Footer setShowPage={handlePageChange} />
                <IosApp />
                <Footer setShowPage={handlePageChange} />
            </>
        )
    }
    else if(showPage === "ANDROID") {
        return(
            <>
                <Footer setShowPage={handlePageChange} />
                <AndroidApp />
                <Footer setShowPage={handlePageChange} />
            </>
        )
    }
    else if(showPage === "SUBMISSION") {
        return(
            <>
                <Footer setShowPage={handlePageChange} />
                <SkateparkInputForm fileListingArray={fileListingArray} />
                <Footer setShowPage={handlePageChange} />
            </>
        )
    }
    else if(showPage === "WELCOME") {
        return(
            <>
                <Footer setShowPage={handlePageChange} />
                <Welcome setShowPage={handlePageChange} pageCount={pageCount}/>
                <Footer setShowPage={handlePageChange} />
            </>
        )
    }
    else if(showPage === "MAP") {
        return(
            <>
                <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <AdvancedMapComponent fileListingArray={fileListingArray}  selectedParkId={parkId}/>
                </APIProvider>
                <Footer setShowPage={handlePageChange} />
            </>
        );
    }
    else if(showPage === "DONATE") {
        return(
            <>
                <Footer setShowPage={handlePageChange} />
                <Donate fileListingArray={fileListingArray}  selectedParkId={parkId}/>
                <Footer setShowPage={handlePageChange} />
            </>
        );
    }
    else {
        return(
            <>
                <Footer setShowPage={handlePageChange} />
            </>
        )
    }
}
export default HomePage;