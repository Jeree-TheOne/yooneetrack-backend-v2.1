import Row from "../Models/Row"
import { db } from "../Utils/db"

import SocketService from './Socket'

/** Service for work with Columns */

class RowService {

  /**
   * Creating row method
   * @param {string} name row name
   * @param {string} workspaceId workspace id
   */
  async create(name: string, workspaceId: string): Promise<void> {
    const { id } = await db.row.create({ data: { name, workspaceId } })
    this.sendChangeSocket(workspaceId, id, 'create')
  }

  /**
   * Updating row method
   * @param {string} id row id
   * @param {string} name row name
   */
  async update(id: string, name: string): Promise<void> {
    const { workspaceId } = await db.row.update({ where: { id } , data: { name } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Deleting row method
   * @param {string} id row id
   */
  async delete(id: string): Promise<void> {
    const { workspaceId } = await db.row.delete({ where: { id }})
    this.sendChangeSocket(workspaceId, id, 'delete')
  }

  /**
   * Select all rows from workspace
   * @param {string} workspaceId workspace id
   * @returns {Row[]} workspace rows
   */
  async selectFromWorkspace(workspaceId: string): Promise<Row[]> {
    const rows = await db.row.findMany({ 
      where: { workspaceId },
      select: {
        id: true,
        name: true,
      } 
    })
    return rows
  }

  /**
   * Select row by id
   * @param {string} id row id
   * @returns {Row} row
   */
  async selectOne(id: string): Promise<Row> {
    const row = await db.row.findFirst({ 
      where: { id },
      select: {
        id: true,
        name: true,
      }
    })

    return row
  }

  /**
   * Method to update rows data by socket
   * @param {string} workspaceId workspace id
   * @param {string} rowId row id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendChangeSocket(workspaceId: string, rowId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const row = action == 'delete' ? { id: rowId } as Row : await this.selectOne(rowId);
    SocketService.updateRows(workspaceId, row, action)
  }
}

export default new RowService()