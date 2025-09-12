import '../Submission.css';
import { useState, useEffect }  from 'react';
import ExifReader from 'exifreader';

function SkateparkInputForm(props){

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        id: '',
        builder: '',
        sqft: '',
        lights: '',
        covered: '',
        url: '',
        elements: '',
        pinimage: '',
        group: ''
    });

    const [photos, setPhotos] = useState([]);
    const [submissionStatus, setSubmissionStatus] = useState("New Submission");
    const [uniquePin, setUniquePin] = useState([]);
    const [uniqueLocationGroup, setLocationGroup] = useState([]);
    const [showOptionalFields, setShowOptionalFields] = useState(false);

    useEffect(() => {
        const uniqueInitialPins = [...new Set(props.fileListingArray.map(item => item.pinimage))];
        uniqueInitialPins.sort();
        setUniquePin(uniqueInitialPins);

        const uniqueLocationGroups = [...new Set(props.fileListingArray.map(item => item.group))];
        uniqueLocationGroups.sort();
        setLocationGroup(uniqueLocationGroups);

    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePhotoUpload = (event) => {
        const files = Array.from(event.target.files);
        setPhotos(files);
        setSubmissionStatus(`${files.length} photo(s) selected`);
    };

    const extractGeoCoordinates = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    // Load the EXIF tags once
                    const tags = ExifReader.load(e.target.result, {expanded: true});

                    // Pass the tags directly to the extraction function
                    const gpsData = extractGPSFromImageTags(tags); // Changed function name

                    console.log('GPS data from extraction:', gpsData);

                    if (gpsData && isValidGPSCoordinates(gpsData)) {
                        resolve({lat: gpsData.latitude, lng: gpsData.longitude});
                    } else {
                        reject('No valid GPS coordinates found');
                    }
                } catch (error) {
                    reject('Error reading EXIF data: ' + error.message);
                }
            };

            reader.readAsArrayBuffer(file);
        });
    };

    function extractGPSFromImageTags(tags) {
        try {
            // Enhanced debugging for Android photos
            console.log('=== DEBUGGING GPS EXTRACTION ===');
            console.log('All available tags:', Object.keys(tags));

            // Log all GPS-related tags for debugging
            console.log('All GPS-related tags found:');
            Object.keys(tags).forEach(key => {
                if (key.toLowerCase().includes('gps') || key.toLowerCase().includes('location')) {
                    console.log(`${key}:`, tags[key]);
                }
            });

            // Check for Android-specific location tags
            console.log('Checking Android-specific tags...');
            const androidTags = ['GPSInfo', 'GPS', 'Location', 'GeoLocation'];
            androidTags.forEach(tag => {
                if (tags[tag]) {
                    console.log(`Found Android tag ${tag}:`, tags[tag]);
                }
            });

            // Check for nested GPS in different structures
            if (tags.exif) {
                console.log('EXIF structure found:', Object.keys(tags.exif));
                if (tags.exif.GPS) {
                    console.log('EXIF.GPS found:', tags.exif.GPS);
                }
            }

            if (tags.ifd0) {
                console.log('IFD0 structure found:', Object.keys(tags.ifd0));
            }

            // Try different possible GPS tag locations
            let gpsData = null;

            // Method 1: Standard GPS tags
            if (tags.GPSLatitude && tags.GPSLongitude && tags.GPSLatitudeRef && tags.GPSLongitudeRef) {
                console.log('Trying standard GPS tags...');
                gpsData = extractFromStandardGPS(tags);
            }

            // Method 2: Check gps sub-object (common in some libraries)
            if (!gpsData && tags.gps) {
                console.log('Trying GPS sub-object...');
                gpsData = extractFromGPSSubObject(tags.gps);
            }

            // Method 3: Check for decimal degree format (some Android apps store it this way)
            if (!gpsData && (tags.GPSLatitude || tags.GPS)) {
                console.log('Trying decimal format...');
                gpsData = extractFromDecimalFormat(tags);
            }

            // Method 4: Check expanded format
            if (!gpsData && tags.exif && tags.exif.GPS) {
                console.log('Trying EXIF GPS sub-object...');
                gpsData = extractFromGPSSubObject(tags.exif.GPS);
            }

            // Method 5: FIXED Android EXIF GPS extraction
            if (!gpsData && tags.exif && tags.exif.GPSLatitude && tags.exif.GPSLongitude) {
                console.log('Trying Android EXIF GPS description fields...');
                console.log('=== DETAILED GPS TAG INSPECTION ===');
                console.log('GPSLatitude full object:', tags.exif.GPSLatitude);
                console.log('GPSLongitude full object:', tags.exif.GPSLongitude);
                console.log('GPSLatitudeRef full object:', tags.exif.GPSLatitudeRef);
                console.log('GPSLongitudeRef full object:', tags.exif.GPSLongitudeRef);

                // Check all properties of each GPS tag
                console.log('GPSLatitude properties:', Object.keys(tags.exif.GPSLatitude));
                console.log('GPSLongitude properties:', Object.keys(tags.exif.GPSLongitude));

                // Log each property's value
                Object.keys(tags.exif.GPSLatitude).forEach(prop => {
                    console.log(`GPSLatitude.${prop}:`, tags.exif.GPSLatitude[prop]);
                });

                Object.keys(tags.exif.GPSLongitude).forEach(prop => {
                    console.log(`GPSLongitude.${prop}:`, tags.exif.GPSLongitude[prop]);
                });

                // Try description fields first (Android often puts readable coordinates here)
                const latTag = tags.exif.GPSLatitude;
                const lngTag = tags.exif.GPSLongitude;
                const latRefTag = tags.exif.GPSLatitudeRef;
                const lngRefTag = tags.exif.GPSLongitudeRef;

                if (latTag.description && lngTag.description) {
                    console.log('Found GPS descriptions:', latTag.description, lngTag.description);

                    const latMatch = latTag.description.match(/[\d.]+/);
                    const lngMatch = lngTag.description.match(/[\d.]+/);

                    if (latMatch && lngMatch) {
                        let lat = parseFloat(latMatch[0]);
                        let lng = parseFloat(lngMatch[0]);

                        // Apply direction
                        if (latTag.description.includes('S') || (latRefTag && latRefTag.description === 'S')) lat = -lat;
                        if (lngTag.description.includes('W') || (lngRefTag && lngRefTag.description === 'W')) lng = -lng;

                        gpsData = { latitude: lat, longitude: lng };
                        console.log('Successfully extracted from Android descriptions:', gpsData);
                    }
                }
            }

            if (gpsData) {
                // Validate coordinates
                if (isNaN(gpsData.latitude) || isNaN(gpsData.longitude) ||
                    gpsData.latitude < -90 || gpsData.latitude > 90 ||
                    gpsData.longitude < -180 || gpsData.longitude > 180 ||
                    (gpsData.latitude === 0 && gpsData.longitude === 0)) {
                    console.log('Invalid coordinates detected:', gpsData);
                    return null;
                }

                console.log('Valid GPS coordinates found:', gpsData);
                return gpsData;
            }

            console.log('No valid GPS coordinates found in any format');
            return null;
        } catch (error) {
            console.error('Error extracting GPS data:', error);
            return null;
        }
    }

    function extractFromStandardGPS(tags) {
        try {
            let lat = convertDMSToDD(tags.GPSLatitude.value, tags.GPSLatitudeRef.value);
            let lng = convertDMSToDD(tags.GPSLongitude.value, tags.GPSLongitudeRef.value);

            if (!isNaN(lat) && !isNaN(lng)) {
                return { latitude: lat, longitude: lng };
            }
        } catch (error) {
            console.log('Standard GPS extraction failed:', error);
        }
        return null;
    }

    function extractFromGPSSubObject(gpsObj) {
        try {
            // Check for simple decimal coordinates first (common format)
            if (gpsObj.Latitude && gpsObj.Longitude &&
                typeof gpsObj.Latitude === 'number' && typeof gpsObj.Longitude === 'number') {
                console.log('Found simple decimal GPS coordinates:', gpsObj.Latitude, gpsObj.Longitude);
                return { latitude: gpsObj.Latitude, longitude: gpsObj.Longitude };
            }

            // Check for different property names with complex structures
            const latProps = ['Latitude', 'latitude', 'GPSLatitude'];
            const lngProps = ['Longitude', 'longitude', 'GPSLongitude'];
            const latRefProps = ['LatitudeRef', 'latitudeRef', 'GPSLatitudeRef'];
            const lngRefProps = ['LongitudeRef', 'longitudeRef', 'GPSLongitudeRef'];

            let lat, lng, latRef, lngRef;

            // Find latitude
            for (const prop of latProps) {
                if (gpsObj[prop]) {
                    lat = gpsObj[prop].value || gpsObj[prop];
                    break;
                }
            }

            // Find longitude
            for (const prop of lngProps) {
                if (gpsObj[prop]) {
                    lng = gpsObj[prop].value || gpsObj[prop];
                    break;
                }
            }

            // Find latitude reference
            for (const prop of latRefProps) {
                if (gpsObj[prop]) {
                    latRef = gpsObj[prop].value || gpsObj[prop];
                    break;
                }
            }

            // Find longitude reference
            for (const prop of lngRefProps) {
                if (gpsObj[prop]) {
                    lngRef = gpsObj[prop].value || gpsObj[prop];
                    break;
                }
            }

            if (lat && lng && latRef && lngRef) {
                let latDecimal = convertDMSToDD(lat, latRef);
                let lngDecimal = convertDMSToDD(lng, lngRef);

                if (!isNaN(latDecimal) && !isNaN(lngDecimal)) {
                    return { latitude: latDecimal, longitude: lngDecimal };
                }
            }
        } catch (error) {
            console.log('GPS sub-object extraction failed:', error);
        }
        return null;
    }

    function extractFromDecimalFormat(tags) {
        try {
            // Some Android apps store GPS as decimal degrees directly
            let lat, lng;

            // Check various possible decimal degree formats
            if (tags.GPSLatitude && typeof tags.GPSLatitude.value === 'number') {
                lat = tags.GPSLatitude.value;
            } else if (tags.GPSLatitude && tags.GPSLatitude.description && !isNaN(parseFloat(tags.GPSLatitude.description))) {
                lat = parseFloat(tags.GPSLatitude.description);
            }

            if (tags.GPSLongitude && typeof tags.GPSLongitude.value === 'number') {
                lng = tags.GPSLongitude.value;
            } else if (tags.GPSLongitude && tags.GPSLongitude.description && !isNaN(parseFloat(tags.GPSLongitude.description))) {
                lng = parseFloat(tags.GPSLongitude.description);
            }

            // Apply direction references if available
            if (lat && lng) {
                if (tags.GPSLatitudeRef && (tags.GPSLatitudeRef.value === 'S' || tags.GPSLatitudeRef.value === ['S'])) {
                    lat = -Math.abs(lat);
                }
                if (tags.GPSLongitudeRef && (tags.GPSLongitudeRef.value === 'W' || tags.GPSLongitudeRef.value === ['W'])) {
                    lng = -Math.abs(lng);
                }

                return { latitude: lat, longitude: lng };
            }
        } catch (error) {
            console.log('Decimal format extraction failed:', error);
        }
        return null;
    }

    function convertDMSToDD(dms, ref) {
        console.log('Converting DMS:', dms, 'Ref:', ref, 'Ref type:', typeof ref);

        // Validate inputs first
        if (!dms || (!ref && ref !== '')) {
            console.error('Missing DMS or reference data');
            return NaN;
        }

        // Handle different possible formats
        let degrees, minutes, seconds;

        if (Array.isArray(dms) && dms.length >= 3) {
            // EXIF format: array of [numerator, denominator] pairs
            try {
                // Handle potential zero denominators or invalid data
                degrees = (dms[0] && dms[0][1] !== 0) ? dms[0][0] / dms[0][1] : 0;
                minutes = (dms[1] && dms[1][1] !== 0) ? dms[1][0] / dms[1][1] : 0;
                seconds = (dms[2] && dms[2][1] !== 0) ? dms[2][0] / dms[2][1] : 0;

                // Check for division by zero or invalid values
                if (!isFinite(degrees) || !isFinite(minutes) || !isFinite(seconds)) {
                    console.error('Invalid DMS values after division:', { degrees, minutes, seconds });

                    // Try alternative: maybe it's already decimal degrees in the first element
                    if (dms[0] && dms[0][1] !== 0) {
                        const decimalValue = dms[0][0] / dms[0][1];
                        if (isFinite(decimalValue) && decimalValue > 0 && decimalValue < 180) {
                            console.log('Using decimal value from first element:', decimalValue);
                            return decimalValue; // Return positive, we'll handle direction below
                        }
                    }

                    return NaN;
                }
            } catch (error) {
                console.error('Error parsing DMS array:', error);
                return NaN;
            }
        } else {
            console.error('Unexpected DMS format:', typeof dms, dms);
            return NaN;
        }

        console.log('Parsed DMS values:', { degrees, minutes, seconds });

        // Convert to decimal degrees
        let dd = degrees + (minutes / 60) + (seconds / 3600);
        console.log('Decimal degrees before direction:', dd);

        // Handle direction reference - Android sometimes has empty arrays
        let direction = null;
        if (Array.isArray(ref)) {
            if (ref.length > 0) {
                direction = ref[0];
            } else {
                console.log('Empty reference array - assuming positive coordinate');
                return dd; // Return as-is, assuming positive
            }
        } else if (typeof ref === 'string') {
            direction = ref;
        } else if (ref && ref.value) {
            direction = ref.value;
        }

        console.log('Reference direction after extraction:', direction);

        // Apply direction if we have it
        if (direction && ['S', 'W'].includes(direction)) {
            dd = dd * -1;
            console.log('Applied negative for', direction, 'result:', dd);
        } else {
            console.log('No negative applied, result:', dd);
        }

        console.log('Final decimal degrees:', dd);
        return dd;
    }

    const isValidGPSCoordinates = (gpsData) => {
        if (!gpsData ||
            gpsData.latitude === undefined ||
            gpsData.longitude === undefined ||
            isNaN(gpsData.latitude) ||
            isNaN(gpsData.longitude)) {
            return false;
        }

        // Check valid coordinate ranges
        if (gpsData.latitude < -90 || gpsData.latitude > 90 ||
            gpsData.longitude < -180 || gpsData.longitude > 180) {
            return false;
        }

        // Reject coordinates that are exactly (0,0) or very close to it
        // This catches many cases of invalid/missing GPS data
        if (Math.abs(gpsData.latitude) < 0.001 && Math.abs(gpsData.longitude) < 0.001) {
            console.warn('GPS coordinates too close to (0,0), likely invalid');
            return false;
        }

        return true;
    };

    const validatePhotos = async (files) => {
        const validatedPhotos = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const coords = await extractGeoCoordinates(file);
                validatedPhotos.push({
                    file: file,
                    coordinates: coords,
                    name: file.name
                });
            } catch (error) {
                errors.push(`${file.name}: ${error}`);
            }
        }

        return { validatedPhotos, errors };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (photos.length === 0) {
            setSubmissionStatus("Please select at least one photo to upload");
            return;
        }

        setSubmissionStatus("Validating photos for GPS coordinates...");

        try {
            const { validatedPhotos, errors } = await validatePhotos(photos);

            if (validatedPhotos.length === 0) {
                setSubmissionStatus(`No valid photos found. All photos must contain GPS coordinates. Errors: ${errors.join(', ')}`);
                return;
            }

            if (errors.length > 0) {
                console.warn("Some photos rejected:", errors);
                setSubmissionStatus(`Warning: ${errors.length} photo(s) rejected for missing GPS data. Proceeding with ${validatedPhotos.length} valid photo(s)...`);
            }

            setSubmissionStatus(`Uploading ${validatedPhotos.length} photo(s)...`);

            const uploadData = new FormData();

            validatedPhotos.forEach((photoData, index) => {
                uploadData.append(`photos`, photoData.file);

                const metadata = {
                    ...formData,
                    coordinates: photoData.coordinates,
                    originalFileName: photoData.name,
                    uploadIndex: index
                };

                uploadData.append(`metadata_${index}`, JSON.stringify(metadata));
            });

            uploadData.append('spotData', JSON.stringify(formData));
            uploadData.append('photoCount', validatedPhotos.length.toString());

            const response = await fetch(process.env.REACT_APP_SUBMISSION_API_URL, {
                method: "POST",
                body: uploadData
            });

            // Parse the response
            const responseData = await response.json();

            if (response.ok && responseData.success) {
                // Success case
                console.log("Submission successful!");
                setSubmissionStatus(`Successfully uploaded ${responseData.processed} photo(s)! Thank you for your submission.`);

                // Reset form
                setFormData({
                    name: '',
                    address: '',
                    id: '',
                    builder: '',
                    sqft: '',
                    lights: '',
                    covered: '',
                    url: '',
                    elements: '',
                    pinimage: '',
                    group: ''
                });
                setPhotos([]);

                const fileInput = document.getElementById('photos');
                if (fileInput) fileInput.value = '';

            } else {
                // Server returned an error response
                console.error("Submission failed with server error:", responseData);

                let errorMessage = "Submission failed";

                if (responseData.error) {
                    errorMessage = responseData.error;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.errors && responseData.errors.length > 0) {
                    errorMessage = `Upload failed: ${responseData.errors.join(', ')}`;
                }

                // Show specific error about GPS data if no photos were processed
                if (responseData.processed === 0 && responseData.total > 0) {
                    errorMessage = `No photos could be uploaded. All ${responseData.total} photo(s) are missing GPS coordinates. Please ensure location services are enabled in your camera app and take photos outdoors with clear GPS signal.`;
                }

                setSubmissionStatus(errorMessage);
            }

        } catch (error) {
            console.error("Network or parsing error:", error);
            setSubmissionStatus("Network error occurred during submission. Please check your connection and try again.");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div id="skateparkinputform" style={{maxWidth: '600px'}}>
                    {/* Main Section - Prominent */}
                    <div style={{marginBottom: '20px', padding: '20px', border: '2px solid #007cba', borderRadius: '8px', backgroundColor: '#f8f9fa'}}>
                        <h3 style={{margin: '0 0 15px 0', color: '#007cba'}}>Upload Skate Spot Photos</h3>
                        <p style={{margin: '0 0 15px 0', fontSize: '16px'}}><strong>Required:</strong> Photos with GPS coordinates (geocoordinates)</p>

                        <div style={{marginBottom: '15px'}}>
                            <label htmlFor="photos" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px'}}>
                                Select Photos*:
                            </label>
                            <input
                                onChange={handlePhotoUpload}
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                required
                                style={{padding: '8px', fontSize: '14px', width: '100%', maxWidth: '400px'}}
                            />
                        </div>

                        <div style={{padding: "10px", backgroundColor: "#e9ecef", border: "1px solid #dee2e6", borderRadius: "4px", marginBottom: '15px'}}>
                            <strong>Status:</strong> <span>{submissionStatus}</span>
                        </div>

                        <input
                            id="mySubmit"
                            name="mySubmit"
                            type="submit"
                            value="Upload Photos & Submit Spot"
                            style={{
                                padding: '12px 24px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                backgroundColor: '#007cba',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    {/* Optional Fields - Less Prominent */}
                    <div style={{marginBottom: '20px'}}>
                        <button
                            type="button"
                            onClick={() => setShowOptionalFields(!showOptionalFields)}
                            style={{
                                background: 'none',
                                border: '1px solid #ccc',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#666'
                            }}
                        >
                            {showOptionalFields ? '− Hide' : '+ Show'} Optional Details
                        </button>
                        <span style={{marginLeft: '10px', fontSize: '13px', color: '#888'}}>
                            (spot name, address, features, etc.)
                        </span>
                    </div>

                    {showOptionalFields && (
                        <div style={{padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px'}}>
                            <h4 style={{margin: '0 0 15px 0', fontSize: '16px', color: '#666'}}>Optional Information</h4>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                                <div>
                                    <label htmlFor="name" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Spot Name:</label>
                                    <input onChange={handleInputChange} type="text" id="name" name="name" placeholder="skatepark/spot name" value={formData.name} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                                <div>
                                    <label htmlFor="address" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Address:</label>
                                    <input onChange={handleInputChange} type="text" id="address" name="address" placeholder="nearest address" value={formData.address} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                                <div>
                                    <label htmlFor="elements" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Features:</label>
                                    <input onChange={handleInputChange} type="text" id="elements" name="elements" placeholder="transition, street, bowl, etc." value={formData.elements} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                                <div>
                                    <label htmlFor="builder" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Builder:</label>
                                    <input onChange={handleInputChange} type="text" id="builder" name="builder" placeholder="builder and/or designer" value={formData.builder} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                                <div>
                                    <label htmlFor="sqft" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Size (sq ft):</label>
                                    <input onChange={handleInputChange} type="text" id="sqft" name="sqft" placeholder="approximate size" value={formData.sqft} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                                <div>
                                    <label htmlFor="lights" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Lights:</label>
                                    <input onChange={handleInputChange} type="text" id="lights" name="lights" placeholder="yes/no/partial" value={formData.lights} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                                <div>
                                    <label htmlFor="covered" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Covered:</label>
                                    <input onChange={handleInputChange} type="text" id="covered" name="covered" placeholder="yes/no/partial" value={formData.covered} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                                <div>
                                    <label htmlFor="url" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Website:</label>
                                    <input onChange={handleInputChange} type="text" id="url" name="url" placeholder="website or social link" value={formData.url} style={{width: '100%', padding: '6px', fontSize: '13px'}} />
                                </div>
                                <div>
                                    <label htmlFor="pinimage" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Pin Style:</label>
                                    <select id="pinimage" name="pinimage" onChange={handleInputChange} value={formData.pinimage} style={{width: '100%', padding: '6px', fontSize: '13px'}}>
                                        <option value="">Select pin image</option>
                                        {uniquePin.map((pin, index) => (
                                            <option key={index} value={pin}>{pin}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="group" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Location Group:</label>
                                    <select id="group" name="group" onChange={handleInputChange} value={formData.group} style={{width: '100%', padding: '6px', fontSize: '13px'}}>
                                        <option value="">Select location group</option>
                                        {uniqueLocationGroup.map((code, index) => (
                                            <option key={index} value={code}>{code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{marginTop: '10px'}}>
                                <label htmlFor="id" style={{display: 'block', fontSize: '13px', color: '#666', marginBottom: '3px'}}>Spot ID:</label>
                                <input onChange={handleInputChange} type="text" id="id" name="id" placeholder="unique spot identifier" value={formData.id} style={{width: '100%', maxWidth: '200px', padding: '6px', fontSize: '13px'}} />
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </>
    );
}

export default SkateparkInputForm;