
export interface WorkHistoryItem {
    id: number;
    date: string;
    location: string;
    status: string;
  }
  
  export class CleanerEntity {
    public workHistory: WorkHistoryItem[];
  
    constructor() {
      this.workHistory = [
        { id: 1, date: '2025-04-01', location: '123 Main St', status: 'Completed' },
        { id: 2, date: '2025-04-03', location: '456 Elm St', status: 'Completed' },
        { id: 3, date: '2025-04-05', location: '789 Oak St', status: 'Completed' },
      ];
    }
  }
  