// src/components/PetitionsEmpty.jsx
import React from 'react';

export default function PetitionsEmpty(){
  return (
    <div className="pe-empty">
      <p>No petitions found with the current filters.</p>
      <div style={{textAlign:'center', marginTop:12}}>
        <button className="clear-btn">Clear Filters</button>
      </div>
    </div>
  );
}
