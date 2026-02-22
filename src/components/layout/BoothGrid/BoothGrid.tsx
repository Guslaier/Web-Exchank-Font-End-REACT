// src/pages/ManageBooth/BoothGrid.tsx
import React from 'react';
import './BoothGrid.css';
import { Link } from 'react-router';
import type { Booth } from '../../../types/booth';  

const BoothGrid: React.FC<{ booths: Booth[] }> = ({ booths }) => {
  return (
    <div className="grid-booth">
      {booths.map((booth) => (
        <Link to={`/manage-transaction/${booth.id}`}
          key={booth.id}
          className={`btn btn-booth-${booth.is_open ? 'open' : 'closed'}`}
        >
          {booth.name}
        </Link>
      ))}
    </div>
  );
};

export default BoothGrid;