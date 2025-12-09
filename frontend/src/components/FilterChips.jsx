// src/components/FilterChips.jsx
import React from 'react';

const chips = ['All Categories','Environment','Infrastructure','Education','Public Safety','Transportation','Healthcare','Housing'];

export default function FilterChips(){
  return (
    <div className="fc-root">
      {chips.map((c,i) => (
        <button key={i} className={`chip ${i===0 ? 'chip-active' : ''}`}>{c}</button>
      ))}
    </div>
  );
}
