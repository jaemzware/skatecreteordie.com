import '../Submission.css';
import { useState, useEffect }  from 'react';

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
                    const arrayBuffer = e.target.result;
                    const dataView = new DataView(arrayBuffer);

                    if (dataView.getUint16(0) !== 0xFFD8) {
                        reject('Not a valid JPEG file');
                        return;
                    }

                    let offset = 2;
                    let marker;
                    let gpsData = null;

                    while (offset < dataView.byteLength) {
                        marker = dataView.getUint16(offset);

                        if (marker === 0xFFE1) {
                            const exifLength = dataView.getUint16(offset + 2);
                            const exifData = new DataView(arrayBuffer, offset + 4, exifLength - 2);

                            if (exifData.getUint32(0) === 0x45786966) {
                                gpsData = extractGPSFromEXIF(exifData);
                                break;
                            }
                        }

                        if (marker === 0xFFDA) break;

                        offset += 2 + dataView.getUint16(offset + 2);
                    }

                    // FIXED: Proper validation that checks for valid numeric coordinates
                    if (gpsData &&
                        gpsData.lat !== undefined &&
                        gpsData.lng !== undefined &&
                        !isNaN(gpsData.lat) &&
                        !isNaN(gpsData.lng) &&
                        gpsData.lat >= -90 && gpsData.lat <= 90 &&
                        gpsData.lng >= -180 && gpsData.lng <= 180 &&
                        !(gpsData.lat === 0 && gpsData.lng === 0)) {
                        resolve(gpsData);
                    } else {
                        reject('No valid GPS coordinates found in image');
                    }

                } catch (error) {
                    reject('Error reading EXIF data: ' + error.message);
                }
            };

            reader.onerror = () => reject('Error reading file');
            reader.readAsArrayBuffer(file);
        });
    };

    const extractGPSFromEXIF = (exifData) => {
        try {
            let offset = 6;
            const tiffHeader = new DataView(exifData.buffer, exifData.byteOffset + offset);

            const byteOrder = tiffHeader.getUint16(0);
            const littleEndian = byteOrder === 0x4949;

            let ifdOffset = tiffHeader.getUint32(4, littleEndian);

            while (ifdOffset !== 0) {
                const ifd = new DataView(exifData.buffer, exifData.byteOffset + offset + ifdOffset);
                const numEntries = ifd.getUint16(0, littleEndian);

                for (let i = 0; i < numEntries; i++) {
                    const entryOffset = 2 + (i * 12);
                    const tag = ifd.getUint16(entryOffset, littleEndian);

                    if (tag === 0x8825) {
                        const gpsIfdOffset = ifd.getUint32(entryOffset + 8, littleEndian);
                        return parseGPSIFD(new DataView(exifData.buffer, exifData.byteOffset + offset + gpsIfdOffset), littleEndian);
                    }
                }

                ifdOffset = ifd.getUint32(2 + (numEntries * 12), littleEndian);
            }

            return null;
        } catch (error) {
            console.error('Error parsing EXIF GPS data:', error);
            return null;
        }
    };

    const parseGPSIFD = (gpsIfd, littleEndian) => {
        const numEntries = gpsIfd.getUint16(0, littleEndian);
        let latitude = null, longitude = null, latRef = null, lngRef = null;

        for (let i = 0; i < numEntries; i++) {
            const entryOffset = 2 + (i * 12);
            const tag = gpsIfd.getUint16(entryOffset, littleEndian);

            switch (tag) {
                case 1:
                    latRef = String.fromCharCode(gpsIfd.getUint8(entryOffset + 8));
                    break;
                case 2:
                    latitude = parseGPSCoordinate(gpsIfd, gpsIfd.getUint32(entryOffset + 8, littleEndian), littleEndian);
                    break;
                case 3:
                    lngRef = String.fromCharCode(gpsIfd.getUint8(entryOffset + 8));
                    break;
                case 4:
                    longitude = parseGPSCoordinate(gpsIfd, gpsIfd.getUint32(entryOffset + 8, littleEndian), littleEndian);
                    break;
            }
        }

        if (latitude && longitude && latRef && lngRef) {
            let lat = latitude[0] + latitude[1]/60 + latitude[2]/3600;
            let lng = longitude[0] + longitude[1]/60 + longitude[2]/3600;

            if (latRef === 'S') lat = -lat;
            if (lngRef === 'W') lng = -lng;

            return { lat, lng };
        }

        return null;
    };

    const parseGPSCoordinate = (gpsIfd, offset, littleEndian) => {
        try {
            const degrees = gpsIfd.getUint32(offset, littleEndian) / gpsIfd.getUint32(offset + 4, littleEndian);
            const minutes = gpsIfd.getUint32(offset + 8, littleEndian) / gpsIfd.getUint32(offset + 12, littleEndian);
            const seconds = gpsIfd.getUint32(offset + 16, littleEndian) / gpsIfd.getUint32(offset + 20, littleEndian);

            return [degrees, minutes, seconds];
        } catch (error) {
            console.error('Error parsing GPS coordinate:', error);
            return null;
        }
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

            if (response.ok) {
                console.log("Submission successful!");
                setSubmissionStatus(`Successfully uploaded ${validatedPhotos.length} photo(s)! Thank you for your submission.`);

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
                console.error("Submission failed.");
                setSubmissionStatus("Submission failed, please try again");
            }

        } catch (error) {
            console.error("An error occurred:", error);
            setSubmissionStatus("An error occurred during submission");
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