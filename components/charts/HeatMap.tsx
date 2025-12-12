import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface HeatMapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
}

interface HeatMapProps {
  data: HeatMapDataPoint[];
  title?: string;
  description?: string;
  colorScale?: string[];
  showLabels?: boolean;
  showLegend?: boolean;
  cellSize?: number;
  gap?: number;
  className?: string;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  title,
  description,
  colorScale = ['#f0f9ff', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'],
  showLabels = true,
  showLegend = true,
  cellSize = 40,
  gap = 4,
  className = ''
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatMapDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Get unique x and y values
  const xValues = Array.from(new Set(data.map((d) => d.x)));
  const yValues = Array.from(new Set(data.map((d) => d.y)));

  // Calculate min and max values
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Get color based on value
  const getColor = (value: number) => {
    if (maxValue === minValue) return colorScale[Math.floor(colorScale.length / 2)];

    const normalized = (value - minValue) / (maxValue - minValue);
    const index = Math.min(
      Math.floor(normalized * colorScale.length),
      colorScale.length - 1
    );
    return colorScale[index];
  };

  // Find data point for given x and y
  const findDataPoint = (x: string | number, y: string | number) => {
    return data.find((d) => d.x === x && d.y === y);
  };

  const handleMouseEnter = (
    dataPoint: HeatMapDataPoint,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setHoveredCell(dataPoint);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      role="figure"
      aria-label={title || 'Heat Map'}
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Heat Map Container */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Y-axis labels */}
          <div className="flex">
            {showLabels && (
              <div className="flex flex-col justify-around pr-4" style={{ width: '80px' }}>
                {yValues.map((y, index) => (
                  <div
                    key={index}
                    className="text-xs font-medium text-gray-700 dark:text-gray-300 text-right"
                    style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
                  >
                    {y}
                  </div>
                ))}
              </div>
            )}

            {/* Grid */}
            <div>
              {/* X-axis labels */}
              {showLabels && (
                <div className="flex mb-2" style={{ gap: `${gap}px` }}>
                  {xValues.map((x, index) => (
                    <div
                      key={index}
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center"
                      style={{ width: `${cellSize}px` }}
                    >
                      {x}
                    </div>
                  ))}
                </div>
              )}

              {/* Heat map cells */}
              <div className="space-y-1" style={{ gap: `${gap}px` }}>
                {yValues.map((y, yIndex) => (
                  <div key={yIndex} className="flex" style={{ gap: `${gap}px` }}>
                    {xValues.map((x, xIndex) => {
                      const dataPoint = findDataPoint(x, y);
                      const value = dataPoint?.value || 0;
                      const color = getColor(value);

                      return (
                        <motion.div
                          key={`${xIndex}-${yIndex}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: (yIndex * xValues.length + xIndex) * 0.01
                          }}
                          whileHover={{ scale: 1.1, zIndex: 10 }}
                          className="rounded cursor-pointer relative"
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            backgroundColor: color
                          }}
                          onMouseEnter={(e) =>
                            dataPoint && handleMouseEnter(dataPoint, e)
                          }
                          onMouseLeave={handleMouseLeave}
                          role="gridcell"
                          aria-label={`${x}, ${y}: ${value}`}
                          tabIndex={0}
                        >
                          {/* Optional value label */}
                          {showLabels && cellSize >= 40 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {value}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-sm">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">
              {hoveredCell.x} × {hoveredCell.y}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Value: <span className="font-medium">{hoveredCell.value}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {minValue}
            </span>
            <div className="flex-1 mx-4 h-4 rounded-full overflow-hidden flex">
              {colorScale.map((color, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: color,
                    width: `${100 / colorScale.length}%`
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {maxValue}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
            Activity Intensity
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Min</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {minValue}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Max</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {maxValue}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HeatMap;
