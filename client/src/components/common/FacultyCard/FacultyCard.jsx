import React from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';

/**
 * Reusable FacultyCard Component
 * Displays teacher profile, department badge, role, qualification, and experience.
 */
export default function FacultyCard({ member, className = '' }) {
  if (!member) return null;

  return (
    <div className={`faculty-profile-card ${className}`}>
      <div className="faculty-card-photo">
        <ImageSlot
          slotKey={member.slotKey}
          ratio="4/3"
          alt={member.name}
          className="faculty-photo-inner"
        />
      </div>
      <div className="faculty-card-info">
        <div className="faculty-dept-badge">{member.department}</div>
        <h3 className="faculty-name">{member.name}</h3>
        <div className="faculty-role">{member.role}</div>
        <div className="faculty-qual">{member.qualification}</div>
        <div className="faculty-exp">
          <Icon name="star" size={13} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
          {member.experience} Experience
        </div>
      </div>
    </div>
  );
}

