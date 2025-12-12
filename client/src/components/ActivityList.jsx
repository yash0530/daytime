import React from 'react';

const ActivityList = ({ activities }) => {

    return (
        <div className="activity-list">
            <h3>Recent Activities</h3>
            {activities.length === 0 ? (
                <p>No activities yet.</p>
            ) : (
                <ul>
                    {activities.map((activity) => (
                        <li key={activity._id} className="activity-item">
                            <div className="activity-header">
                                <span className="activity-desc">{activity.description}</span>
                                <span className="activity-duration">{activity.durationMinutes} min</span>
                            </div>
                            <div className="activity-tags">
                                {activity.tags.map(tag => (
                                    <span key={tag._id} className="tag" style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}>
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                            <div className="activity-date">
                                {new Date(activity.date).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ActivityList;
