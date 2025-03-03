"use client";
import { useState, useEffect } from 'react';
import { Gallery } from './Gallery';

const Page: React.FC = () => {
  const [selectedEdition, setSelectedEdition] = useState<string>(() => {
    // Initialize state from localStorage or default value
    return localStorage.getItem("selectedEdition") || 'edicao2';
  });

  // Update localStorage whenever selectedEdition changes
  useEffect(() => {
    if (selectedEdition) {
      localStorage.setItem("selectedEdition", selectedEdition);
    }
  }, [selectedEdition]);

  return (
    <div>
      <Gallery selectedEdition={selectedEdition} setSelectedEdition={setSelectedEdition} />
    </div>
  );
};

export default Page;
