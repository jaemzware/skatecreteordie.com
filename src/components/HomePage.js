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
    const pageParam = urlParams.get('page'); // Get the page parameter

    const handlePageChange = (page) => {
        setShowPage(page);

        // Update URL with the page parameter
        const url = new URL(window.location);

        if (page === "WELCOME") {
            // Remove page parameter for welcome page (default)
            url.searchParams.delete('page');
            url.searchParams.delete('parkId'); // Also clear parkId
        } else if (page === "MAP") {
            url.searchParams.set('page', 'map');
            // Keep parkId if it exists for MAP page
        } else {
            // Set the page parameter for other pages
            const pageMapping = {
                "LIST": "list",
                "IOS": "ios",
                "ANDROID": "android",
                "SUBMISSION": "submission",
                "DONATE": "donate"
            };
            url.searchParams.set('page', pageMapping[page]);
            url.searchParams.delete('parkId'); // Clear parkId for non-map pages
        }

        window.history.replaceState(null, '', url.toString());
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

        // Set page based on URL parameters
        if (parkId) {
            setShowPage("MAP");
        } else if (pageParam) {
            const pageMapping = {
                "list": "LIST",
                "ios": "IOS",
                "android": "ANDROID",
                "submission": "SUBMISSION",
                "donate": "DONATE",
                "map": "MAP"
            };
            const mappedPage = pageMapping[pageParam.toLowerCase()];
            if (mappedPage) {
                setShowPage(mappedPage);
            }
        }
    }, [parkId, pageParam]);

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