import React, { useState, useMemo } from 'react';
import '../App.css';
import SkateparkView from "./SkateparkView";

function SkateparkListing(props) {
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // Group parks and sort
    const groupedParks = useMemo(() => {
        const groups = {};
        props.fileListingArray.forEach(park => {
            const groupName = park.group || 'Unknown';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(park);
        });

        // Sort parks within each group by name
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        // Return sorted group names with their parks
        return Object.keys(groups)
            .sort()
            .map(groupName => ({
                name: groupName,
                parks: groups[groupName]
            }));
    }, [props.fileListingArray]);

    // Filter parks based on search term
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) {
            return groupedParks;
        }

        const lowerSearch = searchTerm.toLowerCase();

        return groupedParks
            .map(group => ({
                ...group,
                parks: group.parks.filter(park => {
                    // Search all string fields in the record
                    return Object.values(park).some(value =>
                        value && String(value).toLowerCase().includes(lowerSearch)
                    );
                })
            }))
            .filter(group => group.parks.length > 0);
    }, [groupedParks, searchTerm]);

    // Auto-expand groups when searching
    const effectiveExpandedGroups = useMemo(() => {
        if (searchTerm.trim()) {
            // When searching, auto-expand all matching groups
            return new Set(filteredGroups.map(g => g.name));
        }
        return expandedGroups;
    }, [searchTerm, filteredGroups, expandedGroups]);

    const toggleGroup = (groupName) => {
        if (searchTerm.trim()) {
            // Don't allow manual toggle while searching
            return;
        }
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedGroups(new Set(groupedParks.map(g => g.name)));
    };

    const collapseAll = () => {
        setExpandedGroups(new Set());
    };

    const totalParks = filteredGroups.reduce((sum, g) => sum + g.parks.length, 0);

    return (
        <div className="skatepark-listing-container">
            {/* Search and controls */}
            <div className="listing-controls">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search all fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="expand-controls">
                    <button onClick={expandAll} className="expand-btn">
                        Expand All
                    </button>
                    <button onClick={collapseAll} className="collapse-btn">
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Results summary */}
            <div className="results-summary">
                {searchTerm ? (
                    <span>
                        Found <strong>{totalParks}</strong> parks in <strong>{filteredGroups.length}</strong> groups matching "{searchTerm}"
                    </span>
                ) : (
                    <span>
                        <strong>{totalParks}</strong> parks in <strong>{filteredGroups.length}</strong> groups
                    </span>
                )}
            </div>

            {/* Grouped listing */}
            <table id="skateparks">
                <tbody>
                    {filteredGroups.map(group => (
                        <React.Fragment key={`group-${group.name}`}>
                            <tr
                                className="group-header-row"
                                onClick={() => toggleGroup(group.name)}
                            >
                                <td className="group-header">
                                    <span className="expand-icon">
                                        {effectiveExpandedGroups.has(group.name) ? '▼' : '▶'}
                                    </span>
                                    <span className="group-name">{group.name}</span>
                                    <span className="group-count">({group.parks.length} parks)</span>
                                </td>
                            </tr>
                            {effectiveExpandedGroups.has(group.name) && group.parks.map((park, index) => (
                                <tr key={`park-${park.id}`} className="park-row">
                                    <td className="skatepark">
                                        <SkateparkView
                                            id={`skateparkView-${park.id}`}
                                            index={index}
                                            value={park}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {filteredGroups.length === 0 && searchTerm && (
                <div className="no-results">
                    No parks found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
}

export default SkateparkListing;
