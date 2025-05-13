// src/boundary/workHistoryView.tsx

import React from 'react';
import type { WorkHistoryItem } from '../services/Cleaner'; 

interface WorkHistoryViewProps {
  workHistory: WorkHistoryItem[];
}

const WorkHistoryView: React.FC<WorkHistoryViewProps> = ({ workHistory }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Work History</h2>
      <ul>
        {workHistory.map((item) => (
          <li key={item.id} className="mb-4 border-b pb-2">
            <p><strong>Date:</strong> {item.date}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Status:</strong> {item.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkHistoryView;
