import { db } from "../Utils/db"

import SocketService from './Socket'

import PersonalTask from "../Models/PersonalTask"

/** Service for work with Personal tasks */

class PersonalTaskService {

  /**
   * Creating personal task method
   * @param {string} userId user id
   * @param {string} title task title
   * @param {string} description task description
   * @param {string} isImportant task description
   * @param {string} isUrgent task description
   * @param {string} deadline task description
   * @param {string} files task description
  */
 async create(userId: string, title: string, description: string, isImportant = false, isUrgent = false, deadline = new Date(Date.now() + 12096e5), files = [] as string[]): Promise<void> {
    const { id } = await db.personalTask.create({ 
      data: { 
        title, description, isImportant, isUrgent, deadline,
        files: { connect: files.map(file => { return { id: file } }) },
        user: { connect: { id: userId} }
      } 
    })
    this.sendTaskChangeSocket(userId, id, 'create')
  }

  /**
   * Updating personal task method
   * @param {string} id 
   * @param {string} title 
   * @param {string} description 
   * @param {boolean} isImportant 
   * @param {boolean} isUrgent 
   * @param {boolean} isDone 
   * @param {Date} deadline 
   * @param {string[]} files 
   */
  async update(id: string, title: string, description: string, isImportant: boolean, isUrgent: boolean, isDone: boolean, deadline: Date, files = [] as string[]): Promise<void> {
    const { userId } = await db.personalTask.update({ 
      where: { id }, 
      data: { 
        title, description, isImportant, isUrgent, isDone, deadline,
        files: { connect: files.map(file => { return { id: file } }) }
      }, 
    })

    this.sendTaskChangeSocket(userId, id)
  }

  /**
   * Deleting personal task method
   * @param id 
   */
  async delete(id: string): Promise<void> {
    const { userId } = await db.personalTask.delete({ where: { id }})
    this.sendTaskChangeSocket(userId, id, 'delete')
  }

  /**
   * Select all personal task by user id
   * @param {string} userId user id
   * @returns {PersonalTask[]} tasks belongs to user
   */
  async select(userId: string): Promise<PersonalTask[]> {
    const tasks = await db.personalTask.findMany({ where: { userId }, include: { files: true }, orderBy: { createdAt: 'asc'}})
    return tasks.map(task => {
      const { files, userId, ...data } = task
      return {
        ...data,
        files: files.map(file => file.path)
      }
    })
  }

  /**
   * Select personal task by task id
   * @param {string} taskId personal task id
   * @returns {PersonalTask} personal task
   */
  async selectOne(taskId: string): Promise<PersonalTask> {
    const task = await db.personalTask.findFirst({ where: { id: taskId }, include: { files: true } })
    const { files, userId, ...data } = task
    return {
      ...data,
      files: files.map(file => file.path)
    }
  }

  /**
   * Method to update personal task data by socket
   * @param {string} userId user id
   * @param {string} taskId task id
   * @param {'update' | 'create' | 'delete'} action action, which happened with personal task
   */
  async sendTaskChangeSocket(userId: string, taskId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const task = action == 'delete' ? { id: taskId } as PersonalTask : await this.selectOne(taskId);
    SocketService.updatePersonalTasks(userId, task, action)
  }
}

export default new PersonalTaskService()