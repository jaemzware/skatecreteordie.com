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

// Define libraries array outside component to prevent reloading
const libraries = ['geometry', 'drawing'];

// Memoize map options outside component
const mapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
};

const clusterOptions = {
    algorithm: 'clusters',
    minimumClusterSize: 4,
    averageCenter: true,
    zoomOnClick: true,
    gridSize: 60,
};

function MapComponent(props) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const initialCenter = {
        lat: 47.6062,
        lng: -122.3321,
    };

    const [exactLocationHref, setExactLocationHref] = useState("https://skatecreteordie.com");
    const [name, setName] = useState("Tap Map Pins for park data and photos");
    const [address, setAddress] = useState("");
    const [builder, setBuilder] = useState("");
    const [id, setId] = useState("");
    const [sqft, setSqft] = useState("");
    const [lights, setLights] = useState("");
    const [covered, setCovered] = useState("");
    const [url, setUrl] = useState("");
    const [elements, setElements] = useState("");
    const [pinimage, setPinimage] = useState("");
    const [photos, setPhotos] = useState([]);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [group, setGroup] = useState("");
    const [mapCenter, setMapCenter] = useState(initialCenter);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(11);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
    const [selectedPinFilter, setSelectedPinFilter] = useState('ALL');
    const [isPinFilterChanging, setIsPinFilterChanging] = useState(false);

    // Extract unique pinimage values using useMemo
    const uniquePinImages = useMemo(() => {
        if (!props.fileListingArray) return [];
        const pinImages = props.fileListingArray.map(item => item.pinimage);
        return ['ALL', ...new Set(pinImages)].sort();
    }, [props.fileListingArray]);

    const containerStyle = useMemo(() => ({
        width: "100%",
        height: isMobile && isPortrait ? "70vh" : "calc(100vh - 60px)",
    }), [isMobile, isPortrait]);

    const pinCounts = useMemo(() => {
        if (!props.fileListingArray) return {};

        // Initialize with ALL count
        const counts = {
            'ALL': props.fileListingArray.length
        };

        // Count occurrences of each pinimage
        props.fileListingArray.forEach(item => {
            counts[item.pinimage] = (counts[item.pinimage] || 0) + 1;
        });

        return counts;
    }, [props.fileListingArray]);

    const createMarker = useCallback((value) => {
        let marker = {
            lat: parseFloat(value.latitude),
            lng: parseFloat(value.longitude),
            title: value.name,
            name: value.name,
            address: value.address,
            builder: value.builder,
            id: value.id,
            sqft: value.sqft,
            lights: value.lights,
            covered: value.covered,
            url: value.url,
            elements: value.elements,
            pinimage: value.pinimage,
            photos: value.photos.trim().split(" "),
            latitude: value.latitude,
            longitude: value.longitude,
            group: value.group
        };

        switch (value.pinimage) {
            case "dansparklightspin":
                marker.icon = dansparklightspin;
                break;
            case "dansparkpin":
                marker.icon = dansparkpin;
                break;
            case "diyparklightspin":
                marker.icon = diyparklightspin;
                break;
            case "diyparkpin":
                marker.icon = diyparkpin;
                break;
            case "dreamlandpin":
                marker.icon = dreamlandpin;
                break;
            case "dreamlandlightspin":
                marker.icon = dreamlandlightspin;
                break;
            case "evergreenlightspin":
                marker.icon = evergreenlightspin;
                break;
            case "evergreenpin":
                marker.icon = evergreenpin;
                break;
            case "fsrbetonlightspin":
                marker.icon = fsrbetonlightspin;
                break;
            case "fsrbetonpin":
                marker.icon = fsrbetonpin;
                break;
            case "grindlinelightspin":
                marker.icon = grindlinelightspin;
                break;
            case "grindlinepin":
                marker.icon = grindlinepin;
                break;
            case "newlinelightspin":
                marker.icon = newlinelightspin;
                break;
            case "newlinepin":
                marker.icon = newlinepin;
                break;
            case "othergoodparklightspin":
                marker.icon = othergoodparklightspin;
                break;
            case "othergoodparkpin":
                marker.icon = othergoodparkpin;
                break;
            case "spohnranchlightspin":
                marker.icon = spohnranchlightspin;
                break;
            case "spohnranchpin":
                marker.icon = spohnranchpin;
                break;
            case "spotlightspin":
                marker.icon = spotlightspin;
                break;
            case "spotpin":
                marker.icon = spotpin;
                break;
            case "skateparklightspin":
                marker.icon = skateparklightspin;
                break;
            case "skateparkpin":
                marker.icon = skateparkpin;
                break;
            case "teampainlightspin":
                marker.icon = teampainlightspin;
                break;
            case "teampainpin":
                marker.icon = teampainpin;
                break;
            case "woodparklightspin":
                marker.icon = woodparklightspin;
                break;
            case "woodparkpin":
                marker.icon = woodparkpin;
                break;
            case "artisanlightspin":
                marker.icon = artisanlightspin;
                break;
            case "artisanpin":
                marker.icon = artisanpin;
                break;
            default:
                marker.icon = othergoodparkpin;
                console.log(`WARNING: unknown pin: ${value.pinimage}`);
                break;
        }
        return marker;
    }, []);

    const handleMarkerClick = useCallback((marker) => {
        setExactLocationHref("https://www.google.com/search?q=" + marker.lat + "%2C" + marker.lng);
        setName(marker.name);
        setAddress(marker.address);
        setBuilder(marker.builder);
        setId(marker.id);
        setSqft(marker.sqft);
        setLights(marker.lights);
        setCovered(marker.covered);
        setUrl(marker.url);
        setElements(marker.elements);
        setPinimage(marker.pinimage);
        setPhotos(marker.photos);
        setLatitude(marker.latitude);
        setLongitude(marker.longitude);
        setGroup(marker.group);
    }, []);

    // Modify the dropdown onChange handler to handle the loading state
    const handlePinFilterChange = useCallback((e) => {
        const newValue = e.target.value;
        setIsPinFilterChanging(true);

        // Small delay to let the UI update with loading state
        setTimeout(() => {
            setSelectedPinFilter(newValue);

            // Longer delay for the loading state when going from many to few markers
            const delay = pinCounts[newValue] < pinCounts[selectedPinFilter] ? 600 : 300;

            setTimeout(() => {
                setIsPinFilterChanging(false);
            }, delay);
        }, 10);
    }, [pinCounts, selectedPinFilter]);

    // Optimize marker creation and filtering using useMemo
    const markersArray = useMemo(() => {
        if (!props.fileListingArray) return [];

        // Create and filter markers in a single pass
        const markers = props.fileListingArray
            .map(createMarker)
            .filter(marker => selectedPinFilter === 'ALL' || marker.pinimage === selectedPinFilter);

        // Handle selected park ID
        if (props.selectedParkId) {
            const selectedMarker = markers.find(marker => marker.id === props.selectedParkId);
            if (selectedMarker) {
                setMapCenter({ lat: selectedMarker.lat, lng: selectedMarker.lng });
                setZoomLevel(21);
                handleMarkerClick(selectedMarker);
            }
        }

        return markers;
    }, [props.fileListingArray, selectedPinFilter, props.selectedParkId, createMarker, handleMarkerClick]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const centerMapOnCurrentLocation = useCallback(() => {
        if (currentLocation) {
            setZoomLevel(9);
            setMapCenter(currentLocation);
        }
    }, [currentLocation]);

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className={`map-info-container ${isMobile ? 'mobile' : ''} ${isPortrait ? 'portrait' : 'landscape'}`}>
            <div className="map-container">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={zoomLevel}
                    options={mapOptions}
                >
                    {markersArray.length > 0 && (
                        <MarkerClusterer options={clusterOptions}>
                            {(clusterer) => (
                                <>
                                    {markersArray.map((marker, index) => (
                                        <MarkerF
                                            key={`${marker.lat}-${marker.lng}-${index}`}
                                            position={{ lat: marker.lat, lng: marker.lng }}
                                            title={marker.title}
                                            icon={marker.icon}
                                            onClick={() => handleMarkerClick(marker)}
                                            clusterer={clusterer}
                                        />
                                    ))}
                                </>
                            )}
                        </MarkerClusterer>
                    )}
                    {currentLocation && (
                        <MarkerF
                            position={currentLocation}
                            title="Current Location"
                        />
                    )}
                </GoogleMap>
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
                            disabled={isPinFilterChanging}
                        >
                            {uniquePinImages.map(pinType => (
                                <option key={pinType} value={pinType}>
                                    {pinType} ({pinCounts[pinType]})
                                </option>
                            ))}
                        </select>
                        {isPinFilterChanging && (
                            <div className="filtering-indicator">
                                <div className="spinner"></div>
                                <span>Updating map...</span>
                            </div>
                        )}
                    </div>
                </div>
                <table>
                    <tbody>
                    <tr><td><b>Name</b></td><td><a href={`?parkId=${id}`}>{name}</a></td></tr>
                    <tr><td></td><td>
                        <a target="_blank" href={exactLocationHref}>DIRECTIONS</a> |
                        <a target="_blank" href={url}>WEBSITE</a>
                    </td></tr>
                    <tr><td><b>address</b></td><td>{address}</td></tr>
                    <tr><td><b>id</b></td><td>{id}</td></tr>
                    <tr><td><b>builder</b></td><td>{builder}</td></tr>
                    <tr><td><b>sqft</b></td><td>{sqft}</td></tr>
                    <tr><td><b>lights</b></td><td>{lights}</td></tr>
                    <tr><td><b>covered</b></td><td>{covered}</td></tr>
                    <tr><td><b>url</b></td><td><a target="_blank" href={url}>{url}</a></td></tr>
                    <tr><td><b>elements</b></td><td>{elements}</td></tr>
                    <tr><td><b>pinimage</b></td><td>{pinimage}</td></tr>
                    <tr><td><b>photos</b></td><td>{photos}</td></tr>
                    <tr><td><b>latitude</b></td><td>{latitude}</td></tr>
                    <tr><td><b>longitude</b></td><td>{longitude}</td></tr>
                    <tr><td><b>group</b></td><td>{group}</td></tr>
                    </tbody>
                </table>
                <div className="photo-container">
                    {photos.map((photo, index) => (
                        <div key={index} className="photo-item">
                            <a target="_blank" href={`${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`}>
                                <img className="responsive-image" src={`${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`} alt={`${photo}`} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MapComponent;