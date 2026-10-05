import React from 'react';

const ProgressBar = ({
  value = 10,
  total = 100,
  color = '#080808',
  width = '100px' // 👈 default overall width
}) => {
  // Prevent division by zero
  const safeTotal = total === 0 ? 1 : total;

  // Calculate the percentage
  const percentage = Math.min((value / safeTotal) * 100, 100);

  // Container styles
  const containerStyle = {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    height: '10px',
    border: '1px solid #080808'
  };

  // Filler styles
  const fillerStyle = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.5s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  return (
    <div style={{ width, margin: '10px 0' }}>
      <div style={containerStyle}>
        <div style={fillerStyle}></div>
      </div>
    </div>
  );
};

export default ProgressBar;