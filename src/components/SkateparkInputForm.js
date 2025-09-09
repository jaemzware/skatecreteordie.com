import '../Submission.css';
import EXIF from 'exifr';
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
        latitude: '',
        longitude: '',
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

    const extractGeoCoordinates = async (file) => {
        try {
            const exifData = await EXIF.parse(file);
            if (exifData && exifData.latitude && exifData.longitude) {
                return { lat: exifData.latitude, lng: exifData.longitude };
            } else {
                throw new Error('No GPS coordinates found in image');
            }
        } catch (error) {
            throw new Error('Failed to read image metadata');
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
                setSubmissionStatus(`No valid photos found. Errors: ${errors.join(', ')}`);
                return;
            }

            if (errors.length > 0) {
                console.warn("Some photos rejected:", errors);
            }

            setSubmissionStatus(`Uploading ${validatedPhotos.length} photo(s)...`);

            // Create FormData for file upload
            const uploadData = new FormData();

            // Add each validated photo
            validatedPhotos.forEach((photoData, index) => {
                uploadData.append(`photos`, photoData.file);

                // Create metadata for each photo
                const metadata = {
                    ...formData,
                    coordinates: photoData.coordinates,
                    originalFileName: photoData.name,
                    uploadIndex: index
                };

                uploadData.append(`metadata_${index}`, JSON.stringify(metadata));
            });

            // Add general form data
            uploadData.append('spotData', JSON.stringify(formData));
            uploadData.append('photoCount', validatedPhotos.length.toString());

            // Submit to server
            const response = await fetch(process.env.REACT_APP_SUBMISSION_API_URL, {
                method: "POST",
                body: uploadData // Don't set Content-Type header for FormData
            });

            if (response.ok) {
                console.log("Submission successful!");
                setSubmissionStatus(`Successfully uploaded ${validatedPhotos.length} photo(s)! Thank you for your submission.`);

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
                    latitude: '',
                    longitude: '',
                    group: ''
                });
                setPhotos([]);

                // Reset file input
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
                        <td><label htmlFor="latitude">Latitude:</label><input onChange={handleInputChange} type="text" id="latitude" name="latitude" placeholder="will be extracted from photos if present" value={formData.latitude} /></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="longitude">Longitude:</label><input onChange={handleInputChange} type="text" id="longitude" name="longitude" placeholder="will be extracted from photos if present" value={formData.longitude}/></td>
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