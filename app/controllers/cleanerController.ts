// control/cleanerController.ts
import { CleanerEntity } from '../services/Cleaner';

const cleaner = new CleanerEntity();

export function getWorkHistoryData() {
  return cleaner.workHistory;
}
