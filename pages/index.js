import React, { useState } from 'react';
import BarChart from '../components/bar';
import LineChart from '../components/line';
import RadarChart from '../components/radar';
import ScatterChart from '../components/scatter';
import PieChart from '../components/pie';


function App() {
  const [activeComponent, setActiveComponent] = useState(null);

  const handleNavClick = (componentName) => {
    setActiveComponent(componentName);
  };

  return (
    <div>
      <nav>
        <button onClick={() => handleNavClick('BarChart')}>BarChart</button>
        <button onClick={() => handleNavClick('LineChart')}>LineChart</button>
        <button onClick={() => handleNavClick('RadarChart')}>RadarChart</button>
        <button onClick={() => handleNavClick('ScatterChart')}>ScatterChart</button>
        <button onClick={() => handleNavClick('PieChart')}>PieChart</button>

      </nav>

      <div>
        {activeComponent === 'BarChart' && <BarChart />}
        {activeComponent === 'LineChart' && <LineChart />}
        {activeComponent === 'RadarChart' && <RadarChart />}
        {activeComponent === 'ScatterChart' && <ScatterChart />}
        {activeComponent === 'PieChart' && <PieChart />}

      </div>
    </div>
  );
}

export default App;
