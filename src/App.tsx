import React, { useState } from 'react';
import BootSequence from './components/BootSequence';
import MagicalOS from './components/MagicalOS';
import './styles/magical-effects.css';

function App() {
  const [isBooted, setIsBooted] = useState(false);

  const handleBootComplete = () => {
    setIsBooted(true);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {!isBooted ? (
        <BootSequence onBootComplete={handleBootComplete} />
      ) : (
        <MagicalOS />
      )}
    </div>
  );
}

export default App;