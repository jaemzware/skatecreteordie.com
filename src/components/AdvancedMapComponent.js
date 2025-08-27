import React, {useState, useEffect, useMemo, useCallback} from "react";
import { Map, AdvancedMarker, useApiIsLoaded } from '@vis.gl/react-google-maps';
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

function AdvancedMapComponent(props) {
    const apiIsLoaded = useApiIsLoaded();

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
    const [locationClickCount, setLocationClickCount] = useState(0);
    const showLoadingOverlay = (!apiIsLoaded || !props.fileListingArray || isMarkersLoading);

    // Add markers array processing
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
        height: isMobile && isPortrait ? "63vh" : "calc(100vh - 60px)",
    }), [isMobile, isPortrait]);

    // Add pin images and counts for filter
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

    // Add marker click handler
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

    // Add pin filter change handler
    const handlePinFilterChange = useCallback((e) => {
        const newValue = e.target.value;
        setSelectedPinFilter(newValue);
    }, []);

    // Add current location handler
    const centerMapOnCurrentLocation = useCallback(() => {
        if (mapState.currentLocation) {
            setMapState(prev => ({
                ...prev,
                center: mapState.currentLocation,
                zoom: 15
            }));
            setLocationClickCount(prev => prev + 1); // Force re-render
        }
    }, [mapState.currentLocation]);

    // Add geolocation effect
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

    // Add resize handler
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle selected park ID
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

    // Handle marker loading state
    useEffect(() => {
        setIsMarkersLoading(true);

        const timer = setTimeout(() => {
            setIsMarkersLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedPinFilter, props.fileListingArray]);

    if (!apiIsLoaded) {
        return <div>Loading Google Maps...</div>;
    }

    return (
        <div className={`map-info-container ${isMobile ? 'mobile' : ''} ${isPortrait ? 'portrait' : 'landscape'}`}>
            <div className="map-container">
                {showLoadingOverlay && (
                    <div className="map-loading-overlay">
                        <div className="map-loading-text">
                            Loading...
                        </div>
                    </div>
                )}
                <Map
                    key={`${mapState.center.lat}-${mapState.center.lng}-${mapState.zoom}-${locationClickCount}`}
                    mapId="SKATECRETEORDIE_MAP_ID"
                    style={containerStyle}
                    defaultCenter={mapState.center}
                    defaultZoom={mapState.zoom}
                    mapTypeControl={true}
                    streetViewControl={true}
                    fullscreenControl={true}
                    maxZoom={21}
                    minZoom={3}
                >
                    {/* Render actual markers from your data */}
                    {markersArray.map((marker, index) => (
                        <AdvancedMarker
                            key={`${marker.id}-${index}`}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            onClick={() => handleMarkerClick(marker)}
                        >
                            <img src={marker.icon} width="32" height="32" alt={marker.title} />
                        </AdvancedMarker>
                    ))}

                    {/* Current location marker */}
                    {mapState.currentLocation && (
                        <AdvancedMarker
                            position={mapState.currentLocation}
                            title="Current Location"
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'blue',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }} />
                        </AdvancedMarker>
                    )}
                </Map>

                {/* Current location button */}
                <button onClick={centerMapOnCurrentLocation} className="current-location-btn">
                    Current Location
                </button>
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
                <b><a href={`?parkId=${parkInfo.id}`}>{parkInfo.name}</a></b><br />
                <a target="_blank" rel="noopener noreferrer" href={parkInfo.exactLocationHref}>{parkInfo.latitude}, {parkInfo.longitude}</a><br />
                <a target="_blank" rel="noopener noreferrer" href={parkInfo.url}>{parkInfo.url}</a>
                <div className="photo-container">
                    {parkInfo.photos.map((photo, index) => {
                        const imageUrl = photo.startsWith('https://') || photo.startsWith('http://')
                            ? photo
                            : `${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`;
                        return (
                            <div key={index} className="photo-item">
                                <a target="_blank" rel="noopener noreferrer" href={imageUrl}>
                                    <img className="responsive-image" src={imageUrl} alt={`Park photo ${index}`} />
                                </a>
                            </div>
                        );
                    })}
                </div>
                <table>
                    <tbody>
                    <tr><td><b>id</b></td><td>{parkInfo.id}</td></tr>
                    <tr><td><b>address</b></td><td>{parkInfo.address}</td></tr>
                    <tr><td><b>builder</b></td><td>{parkInfo.builder}</td></tr>
                    <tr><td><b>sqft</b></td><td>{parkInfo.sqft}</td></tr>
                    <tr><td><b>lights</b></td><td>{parkInfo.lights}</td></tr>
                    <tr><td><b>covered</b></td><td>{parkInfo.covered}</td></tr>
                    <tr><td><b>elements</b></td><td>{parkInfo.elements}</td></tr>
                    <tr><td><b>pinimage</b></td><td>{parkInfo.pinimage}</td></tr>
                    <tr><td><b>photos</b></td><td>{parkInfo.photos}</td></tr>
                    <tr><td><b>group</b></td><td>{parkInfo.group}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default React.memo(AdvancedMapComponent);