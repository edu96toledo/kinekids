// frontend/src/routes/parent/ChildrenList.tsx
import React from "react";

const ChildrenList: React.FC = () => {
  return (
    <div>
      <h2>Mis Niños</h2>
      {/* Aquí se listarán los niños del padre mediante una llamada a /api/children */}
    </div>
  );
};

export default ChildrenList;
