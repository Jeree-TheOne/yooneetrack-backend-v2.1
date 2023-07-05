import { db } from "../Utils/db"

import Column from "../Models/Column"

import SocketService from './Socket'

/** Service for work with Columns */

class ColumnService {

  /**
   * Creating column method
   * @param {string} name column name
   * @param {string} workspaceId workspace id
   */
  async create(name: string, workspaceId: string): Promise<void> {
    const { id } = await db.column.create({ data: { name, workspaceId } })
    this.sendChangeSocket(workspaceId, id, 'create')
  }

  /**
   * Updating column method
   * @param {string} id column id
   * @param {string} name column name
   */
  async update(id: string, name: string): Promise<void> {
    const { workspaceId } = await db.column.update({ where: { id } , data: { name } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Deleting column method
   * @param {string} id column id
   */
  async delete(id: string): Promise<void> {
    const { workspaceId } = await db.column.delete({ where: { id }})
    this.sendChangeSocket(workspaceId, id, 'delete')
  }

  /**
   * Select all columns from workspace
   * @param {string} workspaceId workspace id
   * @returns {Column[]} workspace columns
   */
  async selectFromWorkspace(workspaceId: string): Promise<Column[]> {
    const columns = await db.column.findMany({ 
      where: { workspaceId },
      select: {
        id: true,
        name: true
      } 
    })
    return columns
  }

  /**
   * Select column by id
   * @param {string} id column id
   * @returns {Column} column
   */
  async selectOne(id: string): Promise<Column> {
    const column = await db.column.findFirst({ 
      where: { id },
      select: {
        id: true,
        name: true
      }
    })
    return column
  }

  /**
   * Method to update columns data by socket
   * @param {string} workspaceId workspace id
   * @param {string} columnId column id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendChangeSocket(workspaceId: string, columnId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const column = action == 'delete' ? { id: columnId } as Column : await this.selectOne(columnId);
    SocketService.updateColumns(workspaceId, column, action)
  }
}

export default new ColumnService()