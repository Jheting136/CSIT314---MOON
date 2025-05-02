// control/cleanerController.ts
import { CleanerEntity } from '../entity/Cleaner';

const cleaner = new CleanerEntity();

export function getWorkHistoryData() {
  return cleaner.workHistory;
}
