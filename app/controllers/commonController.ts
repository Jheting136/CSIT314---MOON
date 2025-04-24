import { DataEntity } from '../models/commonModel';

export class DataController {
  static async fetchTableData(
    table: string,
    columns: string = '*',
    filters?: { column: string, operator: string, value: any }[],
    page?: number,
    pageSize?: number
  ): Promise<{ data: any[], count: number }> {
    return await DataEntity.getData(table, columns, filters, page, pageSize);
  }
}

