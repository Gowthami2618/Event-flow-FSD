import React from 'react';
import GridDistortion from './GridDistortion';

/**
 * GridDistortionBackground provides the full-screen GridDistortion WebGL background layer.
 * Positioned fixed behind all UI content with pointer-events: none to ensure
 * all existing buttons, links, inputs, and interactions remain perfectly clickable.
 */
const GridDistortionBackground = () => {
  return (
    <div
      className="grid-distortion-bg-layer"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <GridDistortion
          imageSrc="https://picsum.photos/1920/1080?grayscale"
          grid={10}
          mouse={0.25}
          strength={0.15}
          relaxation={0.9}
          className="custom-class"
        />
      </div>
    </div>
  );
};

export default GridDistortionBackground;
