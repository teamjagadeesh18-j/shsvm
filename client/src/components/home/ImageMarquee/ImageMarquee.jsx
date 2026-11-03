import React, { useRef, useEffect } from 'react';
import ImageSlot from '../../common/ImageSlot/ImageSlot';
import FullBleedSection from '../../common/FullBleedSection/FullBleedSection';
import { observeAnimation } from '../../../services/animationObserver';
import './ImageMarquee.css';

/**
 * ImageMarquee Component
 * Smooth continuous two-row photo gallery showcasing authentic school celebrations,
 * campus events, national days, sports, cultural dance and student achievements.
 * Converted to high-quality 4:3 WebP format with equal vertical padding and seamless looping.
 */

const ROW_1_SLOTS = [
  { key: 'marquee.campusGate', alt: 'S.H.S.V.M School Campus Entrance & 26th Annual Day Celebration Arch' },
  { key: 'marquee.classicalDance', alt: '26th Annual Day Classical Bharatanatyam Stage Performance' },
  { key: 'marquee.chandrayaan', alt: 'Students Celebrating Chandrayaan-3 Moon Mission with National Flags' },
  { key: 'marquee.parentMeet', alt: 'General Body Parent-Teacher Assembly in School Campus Courtyard' },
  { key: 'marquee.kgGraduation', alt: 'Kindergarten Graduation Day Convocation in Gowns and Caps' },
  { key: 'marquee.schoolBand', alt: 'School Marching Band and Student Assembly with Drums' },
  { key: 'marquee.worldRecord', alt: "Kalam's World Records Achievement Award Presentation Ceremony" }
];

const ROW_2_SLOTS = [
  { key: 'marquee.courtyard', alt: 'Courtyard Student Gathering in Uniforms and Festive Costumes' },
  { key: 'marquee.graduation', alt: '26th Graduation Day Degree Diploma Presentation on Stage' },
  { key: 'marquee.greenDay', alt: 'Kindergarten Environmental Green Day Nature Celebration' },
  { key: 'marquee.kgPerform', alt: 'Kindergarten Annual Day Colorful Stage Performance' },
  { key: 'marquee.danceDuet', alt: 'Classical Indian Traditional Dance Duet by Students on Stage' },
  { key: 'marquee.annualStage', alt: '24th Annual Day Decorated School Stage with Lighting and Floral Decor' },
  { key: 'marquee.stageSetup', alt: 'Official Annual Day Dignitary Stage and Ceremony Dais' }
];

export default function ImageMarquee() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    return observeAnimation(wrapperRef.current);
  }, []);

  return (
    <FullBleedSection
      variant="light"
      className="image-marquee-section"
      ariaLabel="School Events & Campus Photo Showcase"
    >
      <div ref={wrapperRef} className="image-marquee-wrapper">
        
        {/* Row 1: Scrolling Left */}
        <div className="image-marquee-row">
          <div className="image-marquee-track track-left">
            {ROW_1_SLOTS.map((item, idx) => (
              <div key={`m-r1-a-${idx}`} className="image-marquee-card">
                <ImageSlot
                  slotKey={item.key}
                  ratio="4/3"
                  alt={item.alt}
                  className="marquee-image-slot"
                />
              </div>
            ))}
          </div>
          {/* Duplicated track for seamless infinite loop */}
          <div className="image-marquee-track track-left" aria-hidden="true">
            {ROW_1_SLOTS.map((item, idx) => (
              <div key={`m-r1-b-${idx}`} className="image-marquee-card">
                <ImageSlot
                  slotKey={item.key}
                  ratio="4/3"
                  alt={item.alt}
                  className="marquee-image-slot"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="image-marquee-row">
          <div className="image-marquee-track track-right">
            {ROW_2_SLOTS.map((item, idx) => (
              <div key={`m-r2-a-${idx}`} className="image-marquee-card">
                <ImageSlot
                  slotKey={item.key}
                  ratio="4/3"
                  alt={item.alt}
                  className="marquee-image-slot"
                />
              </div>
            ))}
          </div>
          {/* Duplicated track for seamless infinite loop */}
          <div className="image-marquee-track track-right" aria-hidden="true">
            {ROW_2_SLOTS.map((item, idx) => (
              <div key={`m-r2-b-${idx}`} className="image-marquee-card">
                <ImageSlot
                  slotKey={item.key}
                  ratio="4/3"
                  alt={item.alt}
                  className="marquee-image-slot"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </FullBleedSection>
  );
}
