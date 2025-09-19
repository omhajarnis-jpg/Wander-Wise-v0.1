import React from 'react';

interface ARViewProps {
  poiName: string;
  poiCoords: { lat: number; lng: number };
  onClose: () => void;
}

const ARView: React.FC<ARViewProps> = ({ poiName, poiCoords, onClose }) => {
  // A-Frame components are not standard HTML, so we use string literals for attributes that might cause issues with JSX.
  const gpsEntityPlace = `latitude: ${poiCoords.lat}; longitude: ${poiCoords.lng};`;

  return (
    <div className="fixed inset-0 z-50">
      <a-scene
        vr-mode-ui="enabled: false"
        arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
        renderer="antialias: true; alpha: true"
        embedded
      >
        {/* FIX: Converted to a self-closing tag as it has no children, which is better JSX practice. */}
        <a-camera gps-camera rotation-reader />
        <a-entity gps-entity-place={gpsEntityPlace}>
            <a-text
                value={poiName}
                look-at="[gps-camera]"
                scale="15 15 15"
                position="0 5 -20"
                align="center"
                color="#FFFFFF"
                width="30"
            >
                {/* FIX: Converted to a self-closing tag as it has no children, which is better JSX practice. */}
                <a-entity
                    geometry="primitive: plane; width: auto; height: auto;"
                    material="color: #1A202C; opacity: 0.7;"
                    position="0 0 -0.1"
                    text="padding: 0.5;"
                />
            </a-text>
        </a-entity>
      </a-scene>
      
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg font-bold"
        aria-label="Close AR View"
      >
        Close AR
      </button>
    </div>
  );
};

export default ARView;
