import '../App.css';

function SkateparkView(props){
    let geocoordinatelink = "https://www.google.com/search?q=" + props.value.latitude + "%2C" + props.value.longitude;
    return (
        <>
            <p>
                <form>
                    <label htmlFor={"name"}>name:</label>
                    <span id={"name"}>{props.value.name}</span>
                    <br />
                    <label htmlFor={"address"}>address:</label>
                    <span id={"address"}>{props.value.address}</span>
                    <br />
                    <label htmlFor={"id"}>id:</label>
                    <span id={"id"}>{props.value.id}</span>
                    <a href={`?parkId=${props.value.id}`}>{props.value.name}</a>
                    <br />
                    <label htmlFor={"builder"}>builder:</label>
                    <span id={"builder"}>{props.value.builder}</span>
                    <br />
                    <label htmlFor={"sqft"}>sqft:</label>
                    <span id={"sqft"}>{props.value.sqft}</span>
                    <br />
                    <label htmlFor={"lights"}>lights:</label>
                    <span id={"lights"}>{props.value.lights}</span>
                    <br />
                    <label htmlFor={"covered"}>covered:</label>
                    <span id={"covered"}>{props.value.covered}</span>
                    <br />
                    <label htmlFor={"url"}>url:</label>
                    <span id={"url"}><a target={"_blank"} href={props.value.url}>{props.value.url}</a></span>
                    <br />
                    <label htmlFor={"elements"}>elements:</label>
                    <span id={"elements"}>{props.value.elements}</span>
                    <br />
                    <label htmlFor={"pinimage"}>pinimage:</label>
                    <span id={"pinimage"}>{props.value.pinimage}</span>
                    <br />
                    <label htmlFor={"photos"}>photos:</label>
                    <span id={"photos"}>{props.value.photos}</span>
                    <br />
                    <div className="thumbnail-row">
                        {props.value.photos && props.value.photos.split(' ').map((photo, index) => (
                            <a
                                key={index}
                                href={`${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="thumbnail-link"
                            >
                                <img
                                    src={`${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`}
                                    alt={`Skatepark photo ${index + 1}`}
                                    className="thumbnail-image"
                                />
                            </a>
                        ))}
                    </div>
                    <br />
                    <label htmlFor={"latitude"}>latitude:</label>
                    <span id={"latitude"}>{props.value.latitude}</span>
                    <br />
                    <label htmlFor={"longitude"}>longitude:</label>
                    <span id={"longitude"}>{props.value.longitude}</span>
                    <br />
                    <label htmlFor={"group"}>group:</label>
                    <span id={"group"}>{props.value.group}</span>
                    <br />
                    <a href={geocoordinatelink}>DIRECTIONS</a>
                    <br />
                </form>
            </p>
        </>
    );
}

export default SkateparkView;