import { DataEntity } from '../models/commonModel';

export class DataController {
  static async fetchTableData(
    table: string,
    columns: string = '*',
    filters?: { column: string, operator: string, value: any }[]
  ): Promise<any[]> {
    return await DataEntity.getData(table, columns, filters);
  }
}
