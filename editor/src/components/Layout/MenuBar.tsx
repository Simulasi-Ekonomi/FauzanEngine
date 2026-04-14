import React from 'react';

const menus = ['File', 'Edit', 'Window', 'Tools', 'Build', 'Help'];

export function MenuBar() {
  return (
    <div className="neo-menubar">
      <span className="menu-brand">NEOENGINE</span>
      {menus.map((m) => (
        <span key={m} className="menu-item">{m}</span>
      ))}
      <div style={{ flex: 1 }} />
      <span className="menu-item" style={{ color: '#707070', fontSize: 10 }}>
        Fauzan Engine v1.0 — Powered by Aries AI
      </span>
    </div>
  );
}
