import { useState, useEffect } from 'react';

const LoadingSpinner = ({ duration = 800 }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), duration);
    const removeTimer = setTimeout(() => setVisible(false), duration + 500);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [duration]);

  if (!visible) return null;

  return (
    <div className={`spinner-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="spinner">
        <div></div><div></div><div></div><div></div><div></div><div></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
