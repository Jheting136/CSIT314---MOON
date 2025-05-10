import { commonModel } from '../models/commonModel';

export class commonController {
  static async fetchTableData(
    table: string,
    columns: string,
    filters?: { column: string, operator: string, value: any }[],
    page: number,
    pageSize: number
  ): Promise<any[]> {
    return await commonModel.getData(table, columns, filters, page, pageSize);
  }
}