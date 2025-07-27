import React from "react";

const RibbonGroup = ({ title, children }) => {
  return (
    <div className="asta-group">
      <div className="asta-group-title">
        {title}
      </div>
      <div className="flex flex-wrap gap-1">
        {children}
      </div>
    </div>
  );
};

export default RibbonGroup;
