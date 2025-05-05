// controllers/adminApproveController.ts
import {
    fetchPendingRequests,
    setCleanerStatus,
  } from '../models/cleanerRequestModel';
  
  /* PURE type-only import – note the  keywords “import type” */
  import type { CleanerRequest } from '../models/cleanerRequestModel';
  
  export class AdminApproveController {
    async list(): Promise<CleanerRequest[]> {
      return await fetchPendingRequests();
    }
  
    async approve(id: string) {
      return await setCleanerStatus(id, 'approved');
    }
  
    async reject(id: string) {
      return await setCleanerStatus(id, 'rejected');
    }
  }
  