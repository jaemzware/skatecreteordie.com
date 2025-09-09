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

                    if (gpsData) {
                        resolve(gpsData);
                    } else {
                        reject('No GPS coordinates found in image');
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
                <table id="skateparkinputform">
                    <tr>
                        <td colSpan="2">
                            <h3>Upload Skate Spot Photos</h3>
                            <p><strong>Required:</strong> Photos must contain GPS coordinates (geocoordinates) or they will be rejected.</p>
                            <p><em>All fields below are optional - use them to provide additional context about the spot.</em></p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="photos"><strong>Photos*:</strong></label>
                            <input
                                onChange={handlePhotoUpload}
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label htmlFor="name">Spot Name:</label><input onChange={handleInputChange} type="text" id="name" name="name" placeholder="skatepark/spot name" value={formData.name} /></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="address">Address:</label><input onChange={handleInputChange} type="text" id="address" name="address" placeholder="nearest address" value={formData.address}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="id">Spot ID:</label><input onChange={handleInputChange} type="text" id="id" name="id" placeholder="unique spot identifier" value={formData.id}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="builder">Builder:</label><input onChange={handleInputChange} type="text" id="builder" name="builder" placeholder="builder and/or designer" value={formData.builder}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="sqft">Square Feet:</label><input onChange={handleInputChange} type="text" id="sqft" name="sqft" placeholder="approximate size in sq ft" value={formData.sqft}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="lights">Lights:</label><input onChange={handleInputChange} type="text" id="lights" name="lights" placeholder="lighting available? (yes/no/partial)" value={formData.lights}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="covered">Covered:</label><input onChange={handleInputChange} type="text" id="covered" name="covered" placeholder="covered/indoor? (yes/no/partial)" value={formData.covered}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="url">Website:</label><input onChange={handleInputChange} type="text" id="url" name="url" placeholder="website or social media link" value={formData.url}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="elements">Description:</label><input onChange={handleInputChange} type="text" id="elements" name="elements" placeholder="features: transition, street, bowl, etc." value={formData.elements}/></td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="pinimage">Pin Style:</label>
                            <select id="pinimage" name="pinimage" onChange={handleInputChange} value={formData.pinimage}>
                                <option value="">Select pin image (optional)</option>
                                {uniquePin.map((pin, index) => (
                                    <option key={index} value={pin}>
                                        {pin}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="group">Location Group:</label>
                            <select id="group" name="group" onChange={handleInputChange} value={formData.group}>
                                <option value="">Select location group (optional)</option>
                                {uniqueLocationGroup.map((code, index) => (
                                    <option key={index} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div style={{padding: "10px", backgroundColor: "#f5f5f5", border: "1px solid #ddd", borderRadius: "4px"}}>
                                <strong>Status:</strong> <span>{submissionStatus}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><input id="mySubmit" name="mySubmit" type="submit" value="Upload Photos & Submit Spot" /></td>
                    </tr>
                </table>
            </form>
        </>
    );
}

export default SkateparkInputForm;