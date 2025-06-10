import React, { useState } from 'react';
import LooMap from '../components/LooMap';
import LooDetails from '../components/LooDetails';

const HomePage = () => {
  const [selectedLoo, setSelectedLoo] = useState(null);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      <div className="md:w-1/2 h-1/2 md:h-full">
        <LooMap onSelectLoo={setSelectedLoo} />
      </div>
      <div className="md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-white p-6 shadow-lg">
        <LooDetails selectedLoo={selectedLoo} />
      </div>
    </div>
  );
};

export default HomePage;