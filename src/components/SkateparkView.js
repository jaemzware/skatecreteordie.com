import '../App.css';

function SkateparkView(props) {
    const geocoordinatelink = "https://www.google.com/search?q=" + props.value.latitude + "%2C" + props.value.longitude;
    const parkId = props.value.id;

    return (
        <div className="park-card">
            {/* Header with name and link */}
            <div className="park-header">
                <h3 className="park-name">
                    <a href={`?parkId=${props.value.id}`}>{props.value.name}</a>
                </h3>
                <div className="park-header-meta">
                    <span className="park-id">ID: {props.value.id}</span>
                    {props.value.builder && (
                        <span className="park-builder">Built by {props.value.builder}</span>
                    )}
                </div>
            </div>

            {/* Main info grid */}
            <div className="park-details">
                {props.value.address && (
                    <div className="park-detail-item">
                        <span className="detail-icon">📍</span>
                        <span className="detail-text">{props.value.address}</span>
                    </div>
                )}

                <div className="park-meta">
                    {props.value.sqft && (
                        <span className="meta-tag">
                            <strong>Size:</strong> {props.value.sqft}
                        </span>
                    )}
                    {props.value.lights && props.value.lights !== 'N/A' && (
                        <span className="meta-tag">
                            <strong>Lights:</strong> {props.value.lights}
                        </span>
                    )}
                    {props.value.covered && props.value.covered !== 'N/A' && (
                        <span className="meta-tag">
                            <strong>Covered:</strong> {props.value.covered}
                        </span>
                    )}
                </div>

                {props.value.elements && (
                    <div className="park-elements">
                        <p>{props.value.elements}</p>
                    </div>
                )}
            </div>

            {/* Photos */}
            {props.value.photos && (
                <div className="park-photos">
                    <div className="photo-grid">
                        {props.value.photos.split(' ').map((photo, index) => {
                            const isFullUrl = photo.startsWith('http://') || photo.startsWith('https://');
                            const photoUrl = isFullUrl ? photo : `${process.env.REACT_APP_IMAGE_SERVER_URL}${photo}`;
                            return (
                                <a
                                    key={index}
                                    href={photoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="photo-thumb-link"
                                >
                                    <span className="photo-filename">{photo.split('/').pop()}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action links */}
            <div className="park-actions">
                <a href={`?parkId=${props.value.id}`} className="action-btn primary">
                    View on Map
                </a>
                <a href={geocoordinatelink} className="action-btn secondary" target="_blank" rel="noopener noreferrer">
                    Get Directions
                </a>
                {props.value.url && (
                    <a href={props.value.url} className="action-btn secondary" target="_blank" rel="noopener noreferrer">
                        More Info
                    </a>
                )}
            </div>

            {/* Hidden details for reference */}
            <details className="park-raw-data">
                <summary>Technical Details</summary>
                <div className="raw-data-grid">
                    <div><strong>Lat:</strong> {props.value.latitude}</div>
                    <div><strong>Long:</strong> {props.value.longitude}</div>
                    <div><strong>Group:</strong> {props.value.group}</div>
                    {props.value.pinimage && <div><strong>Pin:</strong> {props.value.pinimage}</div>}
                </div>
            </details>
        </div>
    );
}

export default SkateparkView;
