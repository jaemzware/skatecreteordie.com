import '../App.css';

function SkateparkView(props){
    let geocoordinatelink = "https://www.google.com/search?q=" + props.value.latitude + "%2C" + props.value.longitude;
    const parkId = props.value.id;
    return (
        <>
            <p>
                <form>
                    <label htmlFor={`name-${parkId}`}>name:</label>
                    <span id={`name-${parkId}`}>{props.value.name}</span>
                    <br />
                    <label htmlFor={`address-${parkId}`}>address:</label>
                    <span id={`address-${parkId}`}>{props.value.address}</span>
                    <br />
                    <label htmlFor={`id-${parkId}`}>id:</label>
                    <span id={`id-${parkId}`}>{props.value.id}</span>
                    <a href={`?parkId=${props.value.id}`}>{props.value.name}</a>
                    <br />
                    <label htmlFor={`builder-${parkId}`}>builder:</label>
                    <span id={`builder-${parkId}`}>{props.value.builder}</span>
                    <br />
                    <label htmlFor={`sqft-${parkId}`}>sqft:</label>
                    <span id={`sqft-${parkId}`}>{props.value.sqft}</span>
                    <br />
                    <label htmlFor={`lights-${parkId}`}>lights:</label>
                    <span id={`lights-${parkId}`}>{props.value.lights}</span>
                    <br />
                    <label htmlFor={`covered-${parkId}`}>covered:</label>
                    <span id={`covered-${parkId}`}>{props.value.covered}</span>
                    <br />
                    <label htmlFor={`url-${parkId}`}>url:</label>
                    <span id={`url-${parkId}`}><a target={"_blank"} href={props.value.url}>{props.value.url}</a></span>
                    <br />
                    <label htmlFor={`elements-${parkId}`}>elements:</label>
                    <span id={`elements-${parkId}`}>{props.value.elements}</span>
                    <br />
                    <label htmlFor={`pinimage-${parkId}`}>pinimage:</label>
                    <span id={`pinimage-${parkId}`}>{props.value.pinimage}</span>
                    <br />
                    <label htmlFor={`photos-${parkId}`}>photos:</label>
                    <span id={`photos-${parkId}`}>{props.value.photos}</span>
                    <br />
                    <div className="thumbnail-row">
                        {props.value.photos && props.value.photos.split(' ').map((photo, index) => {
                            // Check if the photo already starts with "http://" or "https://"
                            const isFullUrl = photo.startsWith('http://') || photo.startsWith('https://');

                            // Construct the URL based on the condition
                            const photoUrl = isFullUrl ? photo : `${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`;

                            return (
                                <a
                                    key={index}
                                    href={photoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="thumbnail-link"
                                >
                                    <span>{photoUrl}</span>
                                </a>
                            );
                        })}
                    </div>
                    <br />
                    <label htmlFor={`latitude-${parkId}`}>latitude:</label>
                    <span id={`latitude-${parkId}`}>{props.value.latitude}</span>
                    <br />
                    <label htmlFor={`longitude-${parkId}`}>longitude:</label>
                    <span id={`longitude-${parkId}`}>{props.value.longitude}</span>
                    <br />
                    <label htmlFor={`group-${parkId}`}>group:</label>
                    <span id={`group-${parkId}`}>{props.value.group}</span>
                    <br />
                    <a href={geocoordinatelink}>DIRECTIONS</a>
                    <br />
                </form>
            </p>
        </>
    );
}

export default SkateparkView;