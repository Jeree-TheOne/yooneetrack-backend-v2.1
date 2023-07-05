import { db } from "../Utils/db"

import ApiError from "../Exceptions/ApiError"
import SocketService from './Socket'
import Desk from "../Models/Desk"

/** Service for work with Desks */

class DeskService {
  /**
   * Creating a desk method
   * @param {string} name desk name
   * @param {string} workspaceId workspace id
   * @param {boolean} isCurrent is desk become current
   */
  async create(name: string, workspaceId: string, isCurrent = false): Promise<void> {
    const { id } = await db.desk.create({ data: { name,workspaceId } })
    if (isCurrent) await this.setCurrent(id, workspaceId)
    else this.sendChangeSocket(workspaceId, id, 'create')
  }

  /**
   * Updating a desk method
   * @param {string} id desk id
   * @param {string} name desk name
   */
  async update(id: string, name: string): Promise<void> {
    const { workspaceId } = await db.desk.update({ where: { id }, data: { name } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Deleting a desk method
   * @param {string} id desk id
   */
  async delete(id: string): Promise<void> {
    const { workspaceId } = await db.desk.findFirst({ where: { id }})
    const desks = await db.desk.findMany({ where: { workspaceId }})
    if (!desks.length) throw ApiError.BadRequest('Нельзя удалить единственную доску')

    const { isCurrent } = await db.desk.delete({ where: { id }})
    if (isCurrent) await this.setCurrent(desks[0].id)
    else this.sendChangeSocket(workspaceId, id, 'delete')
  }

  /**
   * Method to set a current desk
   * @param {string} id desk id
   * @param {string} workspaceId workspace id
   */
  async setCurrent(id: string, workspaceId: string = null): Promise<void> {
    if (workspaceId) await db.desk.updateMany({ 
      where: { AND: [ { workspaceId }, { isCurrent: true } ] }, 
      data: { isCurrent: false } 
    })
    await db.desk.update({ where: { id }, data: { isCurrent: true } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Select desk by id
   * @param {string} id desk id
   * @returns {Desk} desk
   */
  async selectOne(id: string): Promise<Desk> {
    return await db.desk.findFirst({ 
      where: { id },
      select: {
        id: true,
        name: true,
        isCurrent: true,
      }
    })
  }

  /**
   * Select all desks from workspace
   * @param {string} workspaceId workspace id
   * @returns {Desk[]} workspace desks
   */
  async selectFromWorkspace(workspaceId: string): Promise<Desk[]> {
    const desks = await db.desk.findMany({ 
      where: { workspaceId }, 
      orderBy: { isCurrent: 'desc' },
      select: {
        id: true,
        name: true,
        isCurrent: true
      },
    })
    return desks
  }

  /**
   * Method to update desks data by socket
   * @param {string} workspaceId workspace id
   * @param {string} columnId column id
   * @param {'update' | 'create' | 'delete'} action action, which happened with desk
   */
  async sendChangeSocket(workspaceId: string, deskId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const desk = action == 'delete' ? { id: deskId } as Desk : await this.selectOne(deskId);
    SocketService.updateDesks(workspaceId, desk, action)
  }
}

export default new DeskService()