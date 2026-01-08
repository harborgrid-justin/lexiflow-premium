import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronRight } from 'lucide-react';

interface DrillDownLevel {
  name: string;
  data: any[];
  drillKey?: string;
}

interface DrillDownChartProps {
  levels: DrillDownLevel[];
  title: string;
  dataKey: string;
  xAxisKey: string;
}

export const DrillDownChart: React.FC<DrillDownChartProps> = ({
  levels,
  title,
  dataKey,
  xAxisKey,
}) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([levels[0].name]);

  const currentData = levels[currentLevel].data;

  const handleBarClick = (data: any) => {
    if (currentLevel < levels.length - 1 && levels[currentLevel].drillKey) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setBreadcrumbs([...breadcrumbs, data[levels[currentLevel].drillKey!]]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentLevel(index);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`hover:text-blue-600 ${
                  index === currentLevel ? 'font-medium text-gray-900' : ''
                }`}
              >
                {crumb}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={currentData} onClick={handleBarClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#3b82f6" cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
