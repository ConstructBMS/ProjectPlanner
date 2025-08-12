import React from 'react';

const SwatchRow = ({ colors, onColorSelect, selectedColor }) => {
  return (
    <div className="flex gap-1 p-1">
      {colors.map((color, index) => (
        <button
          key={index}
          className={`w-6 h-6 rounded border-2 transition-all duration-150 hover:scale-110 ${
            selectedColor === color ? 'border-white ring-2 ring-blue-500' : 'border-gray-300'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
          title={color}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};

export default SwatchRow;
