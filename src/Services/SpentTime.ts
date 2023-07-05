import { db } from "../Utils/db"

import SpentTime from "../Models/SpentTime"

import SocketService from './Socket'

/** Service for work with Spent time */

class SpentTimeService {

  /**
   * Adding spent time method
   * @param {string} taskId task id
   * @param {string} userId user, who adding time
   * @param {number} spentTime spent time
   */
  async create(taskId: string, userId: string, spentTime: number): Promise<void> {
    const { id } = await db.spentTime.create({ data: { taskId, userId, spentTime } })
    this.sendChangeSocket(id, taskId, 'create')
  }

  /**
   * Updating spent time method
   * @param {string} id spent time id
   * @param {number} spentTime spent time
   */
  async update(id: string, spentTime: number): Promise<void> {
    const { taskId } = await db.spentTime.update({ 
      where: { id },
      data: { spentTime } 
    })
    this.sendChangeSocket(id, taskId)
  }

  /**
   * Deleting spent time method
   * @param {string} id spent time id 
   */
  async delete(id: string): Promise<void> {
    const { taskId } = await db.spentTime.delete({ where: { id } })
    this.sendChangeSocket(id, taskId, 'delete')
  }

  /**
   * Method to find out is spent time belongs to a task
   * @param {string} taskId task id
   * @param {string} spentTimeId spent time id
   * @returns {boolean} is spent time belongs to a task
   */
  async isTaskHasSpentTime(taskId: string, spentTimeId: string): Promise<boolean> {
    const spentTime = await db.spentTime.findFirst({ where: { taskId, id: spentTimeId } })
    return !!spentTime
  }

  /**
   * Select spent time by id
   * @param {string} id spent time id
   * @returns {SpentTime} spent time instance
   */
  async selectOne(id: string): Promise<SpentTime> {
    const spentTime = await db.spentTime.findFirst({ 
      where: { id },
      select: {
        id: true,
        spentTime: true,
        createdAt: true,
        userId: true
      } 
    })

    return {
      ...spentTime,
      type: 'spentTime'
    }
  }

  /**
   * Getting time, spent on a task
   * @param {string} taskId task id 
   * @returns {number} time spent on a task
   */
  async getSpentTimeOfTask(taskId: string): Promise<number> {
    const spentTime = await db.spentTime.findMany({ where: { taskId } })
    return spentTime.reduce((prev, cur) => prev += cur.spentTime, 0)
  }

  /**
   * Getting all spent time on a task
   * @param {string} taskId task id 
   * @returns {SpentTime[]} spent time instances of a task
   */
  async getAllSpentTimes(taskId: string): Promise<SpentTime[]> {
    const spentTimes = await db.spentTime.findMany({ 
      where: { taskId }, 
      select: {
        id: true,
        spentTime: true,
        createdAt: true,
        userId: true
      }
    })
    return spentTimes.map(spentTime => { 
      return {
        ...spentTime,
        type: 'spentTime'
      }
    })
  }

  /**
   * Method to update spent time data by socket
   * @param {string} spentTimeId spent time id
   * @param {string} taskId task id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendChangeSocket(spentTimeId: string, taskId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const spentTime = action == 'delete' ? { id: spentTimeId } as SpentTime : await this.selectOne(spentTimeId);
    SocketService.updateTaskWall(taskId, spentTime, action)
  }
}

export default new SpentTimeService()