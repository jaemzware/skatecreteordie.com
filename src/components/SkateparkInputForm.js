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
        photos: '',
        latitude: '',
        longitude: '',
        group: ''
    });

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

    const handleSubmit = (event) => {
        event.preventDefault();

        const submissionData = {
            submission: {
                ...formData, // Include existing form data
            },
        };

        setSubmissionStatus(`Sending submission ...`);
        console.log(submissionData);

        // Perform a POST fetch to the specified URL
        fetch(process.env.REACT_APP_SUBMISSION_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submissionData)
        })
            .then(response => {
                if (response.ok) {
                    // Successful submission, you can handle the response here
                    console.log("Submission successful!");
                    setSubmissionStatus("Submitted, Thank You! Email photos to crete@skatecreteordie.com with the park name.");
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
                        photos: '',
                        latitude: '',
                        longitude: '',
                        group: ''
                    });
                } else {
                    // Handle errors if the POST request fails
                    console.error("Submission failed.");
                    setSubmissionStatus("Submission failed, sorry");
                }
            })
            .catch(error => {
                // Handle network or other errors
                console.error("An error occurred:", error);
                setSubmissionStatus("Submission failed, sorry:", error);
            });

    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <table id="skateparkinputform">
                    <tr>
                        <td><label htmlFor="name">name:</label><input onChange={handleInputChange} type="text" id="name" name="name" placeholder="skatepark name" value={formData.name} /></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="address">address:</label><input onChange={handleInputChange} type="text" id="address" name="address" placeholder="nearest address" value={formData.address}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="id">id:</label><input onChange={handleInputChange} type="text" id="id" name="id" placeholder="unique park id" value={formData.id}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="builder">builder:</label><input onChange={handleInputChange} type="text" id="builder" name="builder" placeholder="builder and/or designer" value={formData.builder}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="sqft">sqft:</label><input onChange={handleInputChange} type="text" id="sqft" name="sqft" placeholder="square feet of the park" value={formData.sqft}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="lights">lights:</label><input onChange={handleInputChange} type="text" id="lights" name="lights" placeholder="lights? yes, no, complicated?" value={formData.lights}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="covered">covered:</label><input onChange={handleInputChange} type="text" id="covered" name="covered" placeholder="covered? yes, no, complicated?" value={formData.covered}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="url">url:</label><input onChange={handleInputChange} type="text" id="url" name="url" placeholder="website for more information" value={formData.url}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="elements">elements:</label><input onChange={handleInputChange} type="text" id="elements" name="elements" placeholder="description of park. transition? street? elements?" value={formData.elements}/></td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="pinimage">pinimage:</label>
                            <select id="pinimage" name="pinimage" onChange={handleInputChange}>
                                <option value="">Select a PIN IMAGE</option>
                                {uniquePin.map((pin, index) => (
                                    <option key={index} value={pin}>
                                        {pin}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td><label htmlFor="photos">photos:</label><input onChange={handleInputChange} type="text" id="photos" name="photos" placeholder="photo names (email to me)" value={formData.photos}/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="latitude">latitude:</label><input onChange={handleInputChange} type="text" id="latitude" name="latitude" placeholder="latitude" value={formData.latitude} /></td>
                    </tr>
                    <tr>
                        <td><label htmlFor="longitude">longtitude:</label><input onChange={handleInputChange} type="text" id="longitude" name="longitude" placeholder="longitude" value={formData.longitude}/></td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="group">group:</label>
                            <select id="group" name="group" onChange={handleInputChange}>
                                <option value="">Select a Location</option>
                                {uniqueLocationGroup.map((code, index) => (
                                    <option key={index} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <span>{submissionStatus}</span>
                    </tr>
                    <tr>
                        <td><input id="mySubmit" name="mySubmit" type="submit" value="Submit Park" disabled={false}/></td>
                    </tr>
                </table>
            </form>
        </>
    );
}

export default SkateparkInputForm;