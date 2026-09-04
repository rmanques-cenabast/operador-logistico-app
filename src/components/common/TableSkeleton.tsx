import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 8 }) => {
  return (
    <tbody className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="bg-white">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-5">
              <div 
                className="h-4 bg-slate-200/80 rounded"
                style={{ 
                  width: cIdx === 0 ? '60%' : cIdx === 1 ? '80%' : cIdx === columns - 1 ? '40%' : '70%' 
                }}
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
