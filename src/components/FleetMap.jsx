import React from 'react';

const FleetMap = ({ riders }) => {
  // Rough projection for visualization (Mumbai-centric)
  // Assuming riders are within a small lat/lng range
  // Latitude: ~19.0 to 19.2
  // Longitude: ~72.8 to 72.9
  
  const project = (lat, lng) => {
    if (!lat || !lng) return { top: '50%', left: '50%' };
    
    const minLat = 19.0;
    const maxLat = 19.2;
    const minLng = 72.8;
    const maxLng = 73.0;

    const top = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    const left = ((lng - minLng) / (maxLng - minLng)) * 100;

    return { 
      top: `${Math.max(5, Math.min(95, top))}%`, 
      left: `${Math.max(5, Math.min(95, left))}%` 
    };
  };

  return (
    <div className="radar-map-container">
      <div className="radar-grid"></div>
      <div className="radar-scan"></div>
      
      {riders.map((rider) => {
        const pos = project(rider.location?.lat, rider.location?.lng);
        return (
          <div 
            key={rider._id} 
            className={`rider-blip ${rider.status === 'On Delivery' ? 'on-delivery' : ''}`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="blip-label">
              <strong>{rider.name}</strong><br/>
              {rider.status}
            </div>
          </div>
        );
      })}

      <div className="radar-watermark">FLEET_SURVEILLANCE_v2.0</div>
    </div>
  );
};

export default FleetMap;
