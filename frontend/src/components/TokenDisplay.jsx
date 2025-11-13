import React, { useState, useEffect } from 'react';
import { Card } from './ReactBits';

const TokenDisplay = ({ token, credits, animate = false }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (animate) {
      setTimeout(() => setShow(true), 100);
    } else {
      setShow(true);
    }
  }, [animate]);

  return (
    <Card className={`text-center ${animate ? 'coin-animation' : ''} ${show ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <div className="text-6xl mb-4">🪙</div>
      <div className="text-4xl font-bold text-forest mb-2">{token}</div>
      {credits !== undefined && (
        <div className="text-xl text-olive font-semibold">
          {credits} Credits
        </div>
      )}
    </Card>
  );
};

export default TokenDisplay;
