import { db } from "../Utils/db"

import SocketService from './Socket'

import History from "../Models/History"

/** Service for work with History */
class HistoryService {

  /**
   * Adding history method
   * @param {string} taskId task id
   * @param {string} userId user id
   * @param {string[]} updatedFields updated fields
   * @param {string[]} fieldsValues current fields values
   * @param {string[]} previousValues previous fields values
   */
  async create(taskId: string, userId: string, updatedFields: string[], fieldsValues: string[] | string[][], previousValues: string[] | string[][]): Promise<void> {
    const { id } = await db.history.create({ 
      data: { 
        taskId, userId, updatedFields, 
        fieldsValues: fieldsValues.map(value => String(value)), 
        previousValues: previousValues.map(value => String(value)) 
      } 
    })

    this.sendChangeSocket(id, taskId)
  }

  /**
   * Getting all histories of a task
   * @param {string} taskId task id
   * @returns {History[]} histories instances of a task
   */
  async getAllHistories(taskId: string): Promise<History[]> {
    const histories = await db.history.findMany({ 
      where: { taskId },
      select: {
        id: true,
        updatedFields: true,
        fieldsValues: true,
        previousValues: true,
        createdAt: true,
        userId: true
      } 
    })
    return histories.map(history => { 
      return {
        ...history,
        type: 'history'
      }
    })
  }

  /**
   * Selecting history by id
   * @param {string} id history id
   * @returns {History} history instance
   */
  async selectOne(id: string): Promise<History> {
    const history = await db.history.findFirst({ 
      where: { id },
      select: {
        id: true,
        updatedFields: true,
        fieldsValues: true,
        previousValues: true,
        createdAt: true,
        userId: true
      } 
    })
    return {
      ...history,
      type: 'history'
    }
  }

  /**
   * Method to update history data by socket
   * @param {string} historyId history id
   * @param {string} taskId task id
   */
  async sendChangeSocket(historyId: string, taskId: string): Promise<void> {
    const history = await this.selectOne(historyId)
    SocketService.updateTaskWall(taskId, history, 'create')
  }
}

export default new HistoryService()