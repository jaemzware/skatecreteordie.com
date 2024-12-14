import '../App.css';
import React, {useState, useEffect, useMemo, useCallback} from "react";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import { MarkerClusterer } from '@react-google-maps/api';
import artisanpin from '../images/artisanpin.png';
import artisanlightspin from '../images/artisanpin.png';
import dansparkpin from '../images/dansparkpin.png';
import dansparklightspin from '../images/dansparklightspin.png';
import diyparkpin from '../images/diyparkpin.png';
import diyparklightspin from '../images/diyparklightspin.png';
import dreamlandpin from '../images/dreamlandpin.png';
import dreamlandlightspin from '../images/dreamlandlightspin.png';
import evergreenlightspin from '../images/evergreenlightspin.png';
import evergreenpin from '../images/evergreenpin.png';
import fsrbetonlightspin from '../images/fsrbetonlightspin.png';
import fsrbetonpin from '../images/fsrbetonpin.png';
import grindlinelightspin from '../images/grindlinelightspin.png';
import grindlinepin from '../images/grindlinepin.png';
import newlinepin from '../images/newlinepin.png';
import newlinelightspin from '../images/newlinelightspin.png';
import othergoodparklightspin from '../images/othergoodparklightspin.png';
import othergoodparkpin from '../images/othergoodparkpin.png';
import spohnranchlightspin from '../images/spohnranchlightspin.png';
import spohnranchpin from '../images/spohnranchpin.png';
import spotlightspin from '../images/spotlightspin.png';
import spotpin from '../images/spotpin.png';
import skateparklightspin from '../images/skateparklightspin.png';
import skateparkpin from '../images/skateparkpin.png';
import teampainlightspin from '../images/teampainlightspin.png';
import teampainpin from '../images/teampainpin.png';
import woodparklightspin from '../images/woodparklightspin.png';
import woodparkpin from '../images/woodparkpin.png';

// Create icon mapping function
const getMarkerIcon = (pinimage) => {
    const iconMap = {
        dansparklightspin,
        dansparkpin,
        diyparklightspin,
        diyparkpin,
        dreamlandpin,
        dreamlandlightspin,
        evergreenlightspin,
        evergreenpin,
        fsrbetonlightspin,
        fsrbetonpin,
        grindlinelightspin,
        grindlinepin,
        newlinelightspin,
        newlinepin,
        othergoodparklightspin,
        othergoodparkpin,
        spohnranchlightspin,
        spohnranchpin,
        spotlightspin,
        spotpin,
        skateparklightspin,
        skateparkpin,
        teampainlightspin,
        teampainpin,
        woodparklightspin,
        woodparkpin,
        artisanlightspin,
        artisanpin
    };

    return iconMap[pinimage] || othergoodparkpin;
};

// Define libraries array outside component to prevent reloading
const libraries = ['geometry', 'drawing'];

// Memoize map options outside component
const mapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    maxZoom: 21,
    minZoom: 3,
};

// Optimize cluster options
const clusterOptions = {
    algorithm: 'clusters',
    minimumClusterSize: 5,
    averageCenter: true,
    zoomOnClick: true,
    gridSize: 60, // Reduced for better performance
    maxZoom: 15,
    enableRetinaIcons: true,
    ignoreHidden: false,
    // Add these options
    batchSize: 100,
    batchSizeIE: 100
};

function MapComponent(props) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    });


    // Combine related state into a single object to reduce re-renders
    const [parkInfo, setParkInfo] = useState({
        exactLocationHref: "https://skatecreteordie.com",
        name: "Tap Map Pins for park data and photos",
        address: "",
        builder: "",
        id: "",
        sqft: "",
        lights: "",
        covered: "",
        url: "",
        elements: "",
        pinimage: "",
        photos: [],
        latitude: "",
        longitude: "",
        group: ""
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
    const [selectedPinFilter, setSelectedPinFilter] = useState('ALL');
    const [isMarkersLoading, setIsMarkersLoading] = useState(true);

    const showLoadingOverlay = (!isLoaded || !props.fileListingArray || isMarkersLoading);

    const markersArray = useMemo(() => {
        if (!props.fileListingArray) {
            return [];
        }

        return props.fileListingArray
            .filter(item => selectedPinFilter === 'ALL' || item.pinimage === selectedPinFilter)
            .map(value => ({
                lat: parseFloat(value.latitude),
                lng: parseFloat(value.longitude),
                title: value.name,
                ...value,
                icon: getMarkerIcon(value.pinimage)
            }));
    }, [props.fileListingArray, selectedPinFilter]);

    const initialCenter = useMemo(() => ({
        lat: 47.6062,
        lng: -122.3321,
    }), []);

    const containerStyle = useMemo(() => ({
        width: "100%",
        height: isMobile && isPortrait ? "70vh" : "calc(100vh - 60px)",
    }), [isMobile, isPortrait]);

    // Memoize unique pin images and counts
    const { uniquePinImages, pinCounts } = useMemo(() => {
        if (!props.fileListingArray) {
            return { uniquePinImages: [], pinCounts: {} };
        }

        const pinImages = ['ALL', ...new Set(props.fileListingArray.map(item => item.pinimage))].sort();
        const counts = {
            'ALL': props.fileListingArray.length,
            ...props.fileListingArray.reduce((acc, item) => {
                acc[item.pinimage] = (acc[item.pinimage] || 0) + 1;
                return acc;
            }, {})
        };

        return { uniquePinImages: pinImages, pinCounts: counts };
    }, [props.fileListingArray]);

    const [mapState, setMapState] = useState({
        center: initialCenter,
        zoom: 11,
        currentLocation: null
    });

    // Simplified marker click handler
    const handleMarkerClick = useCallback((marker) => {
        setParkInfo({
            exactLocationHref: `https://www.google.com/search?q=${marker.lat}%2C${marker.lng}`,
            name: marker.name,
            address: marker.address,
            builder: marker.builder,
            id: marker.id,
            sqft: marker.sqft,
            lights: marker.lights,
            covered: marker.covered,
            url: marker.url,
            elements: marker.elements,
            pinimage: marker.pinimage,
            photos: marker.photos.trim().split(" "),
            latitude: marker.latitude,
            longitude: marker.longitude,
            group: marker.group
        });
    }, []);

    const handlePinFilterChange = useCallback((e) => {
        const newValue = e.target.value;
        setSelectedPinFilter(newValue);
    }, []);

    const renderMarkers = useCallback((clusterer) => (
        markersArray.map((marker, index) => (
            <MarkerF
                key={`${marker.id}-${index}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.title}
                icon={marker.icon}
                onClick={() => handleMarkerClick(marker)}
                clusterer={clusterer}
                options={{
                    optimized: true, // Enable marker optimization
                    visible: true
                }}
            />
        ))
    ), [markersArray, handleMarkerClick]);

    const ClusteredMarkers = React.memo(({ clusterer }) => renderMarkers(clusterer))

    // Optimize geolocation handling
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setMapState(prev => ({
                    ...prev,
                    currentLocation: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }));
            });
        }
    }, []);

    // Optimize resize handler
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle selected park ID more efficiently
    useEffect(() => {
        if (props.selectedParkId && props.fileListingArray) {
            const selectedPark = props.fileListingArray.find(item => item.id === props.selectedParkId);
            if (selectedPark) {
                setMapState(prev => ({
                    ...prev,
                    center: {
                        lat: parseFloat(selectedPark.latitude),
                        lng: parseFloat(selectedPark.longitude)
                    },
                    zoom: 21
                }));
                handleMarkerClick({
                    ...selectedPark,
                    lat: parseFloat(selectedPark.latitude),
                    lng: parseFloat(selectedPark.longitude)
                });
            }
        }
    }, [props.selectedParkId, props.fileListingArray, handleMarkerClick]);

    useEffect(() => {
        setIsMarkersLoading(true);

        const timer = setTimeout(() => {
            setIsMarkersLoading(false);
        }, 500); // Increased timeout to ensure visibility

        return () => clearTimeout(timer);
    }, [selectedPinFilter, props.fileListingArray]);

    useEffect(() => {
        console.log('Loading state changed:', {
            isLoaded,
            hasFileListingArray: !!props.fileListingArray,
            isMarkersLoading,
            filterValue: selectedPinFilter,
            markerCount: markersArray.length
        });
    }, [isLoaded, props.fileListingArray, isMarkersLoading, selectedPinFilter, markersArray]);

    const centerMapOnCurrentLocation = useCallback(() => {
        if (mapState.currentLocation) {
            setMapState(prev => ({
                ...prev,
                center: mapState.currentLocation,
                zoom: 9
            }));
        }
    }, [mapState.currentLocation]);

    return (
        <div className={`map-info-container ${isMobile ? 'mobile' : ''} ${isPortrait ? 'portrait' : 'landscape'}`}>
            <div className="map-container">
                {showLoadingOverlay && (
                    <div className="map-loading-overlay">
                        <div className="map-loading-text">
                            {!isLoaded ? "Loading Google Maps..." :
                                !props.fileListingArray ? "Loading data..." :
                                    "Loading markers..."}
                        </div>
                    </div>
                )}
                {isLoaded && (
                    <>
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={mapState.center}
                            zoom={mapState.zoom}
                            options={mapOptions}
                        >
                            {markersArray.length > 0 && (
                                <MarkerClusterer options={clusterOptions}>
                                    {(clusterer) => <ClusteredMarkers clusterer={clusterer} />}
                                </MarkerClusterer>
                            )}
                            {mapState.currentLocation && (
                                <MarkerF
                                    position={mapState.currentLocation}
                                    title="Current Location"
                                />
                            )}
                        </GoogleMap>
                        <button onClick={centerMapOnCurrentLocation} className="current-location-btn">
                            Current Location
                        </button>
                    </>
                )}
            </div>
            <div className="info-panel">
                <div className="pin-filter">
                    <div className="filter-header">
                        <label htmlFor="pinFilter">Filter by Pin Type: </label>
                        <select
                            id="pinFilter"
                            value={selectedPinFilter}
                            onChange={handlePinFilterChange}
                            className="pin-filter-select"
                        >
                            {uniquePinImages.map(pinType => (
                                <option key={pinType} value={pinType}>
                                    {pinType} ({pinCounts[pinType]})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <table>
                    <tbody>
                    <tr><td><b>Name</b></td><td><a href={`?parkId=${parkInfo.id}`}>{parkInfo.name}</a></td></tr>
                    <tr><td>Links</td><td>
                        <a target="_blank" rel="noopener noreferrer" href={parkInfo.exactLocationHref}>DIRECTIONS</a> |
                        <a target="_blank" rel="noopener noreferrer" href={parkInfo.url}>WEBSITE</a>
                    </td></tr>
                    <tr><td><b>address</b></td><td>{parkInfo.address}</td></tr>
                    <tr><td><b>id</b></td><td>{parkInfo.id}</td></tr>
                    <tr><td><b>builder</b></td><td>{parkInfo.builder}</td></tr>
                    <tr><td><b>sqft</b></td><td>{parkInfo.sqft}</td></tr>
                    <tr><td><b>lights</b></td><td>{parkInfo.lights}</td></tr>
                    <tr><td><b>covered</b></td><td>{parkInfo.covered}</td></tr>
                    <tr><td><b>url</b></td><td><a target="_blank" rel="noopener noreferrer" href={parkInfo.url}>{parkInfo.url}</a></td></tr>
                    <tr><td><b>elements</b></td><td>{parkInfo.elements}</td></tr>
                    <tr><td><b>pinimage</b></td><td>{parkInfo.pinimage}</td></tr>
                    <tr><td><b>photos</b></td><td>{parkInfo.photos}</td></tr>
                    <tr><td><b>latitude</b></td><td>{parkInfo.latitude}</td></tr>
                    <tr><td><b>longitude</b></td><td>{parkInfo.longitude}</td></tr>
                    <tr><td><b>group</b></td><td>{parkInfo.group}</td></tr>
                    </tbody>
                </table>
                <div className="photo-container">
                    {parkInfo.photos.map((photo, index) => (
                        <div key={index} className="photo-item">
                            <a target="_blank" rel="noopener noreferrer" href={`${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`}>
                                <img className="responsive-image" src={`${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`} alt={`${photo}`} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default React.memo(MapComponent);
