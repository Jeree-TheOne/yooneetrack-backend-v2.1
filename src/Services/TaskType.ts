import TaskType from "../Models/TaskType"
import { db } from "../Utils/db"

import SocketService from './Socket'

/** Service for work with Task Types */

class TaskTypeService {

  /**
   * Create a new Task Type
   * @param {string} name task type name
   * @param {string} workspaceId workspace id
   */
  async create(name: string, workspaceId: string): Promise<void> {
    const { id } = await db.taskType.create({ data: { name, workspaceId } })
    this.sendChangeSocket(workspaceId, id, 'create')
  }

  /**
   * Updating a task type
   * @param {string} id task type id
   * @param {string} name task type new name
   */
  async update(id: string, name: string): Promise<void> {
    const { workspaceId } = await db.taskType.update({ where: { id } , data: { name } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Deleting a task type
   * @param {string} id task type id
   */
  async delete(id: string): Promise<void> {
    const { workspaceId } = await db.taskType.delete({ where: { id }})
    this.sendChangeSocket(workspaceId, id, 'delete')
  }

  /**
   * Getting all task types of a workspace
   * @param {string} workspaceId workspace id
   * @returns {TaskType[]} task types of workspace
   */
  async selectFromWorkspace(workspaceId: string): Promise<TaskType[]> {
    const taskTypes = await db.taskType.findMany({ 
      where: { workspaceId },
      select: {
        id: true,
        name: true,
      }
    })
    return taskTypes
  }

  /**
   * Getting task type by id
   * @param {string} taskTypeId task type id
   * @returns {TaskType} task type instance
   */
  async selectOne(taskTypeId: string): Promise<TaskType> {
    const taskType = await db.taskType.findFirst({ 
      where: { id: taskTypeId },
      select: {
        id: true,
        name: true
      }
    })

    return taskType
  }

  /**
   * Method to update task types data by socket
   * @param {string} workspaceId workspace id
   * @param {string} taskTypeId column id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendChangeSocket(workspaceId: string, taskTypeId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const taskType = action == 'delete' ? { id: taskTypeId } as TaskType : await this.selectOne(taskTypeId);
    SocketService.updateTaskTypes(workspaceId, taskType, action)
  }
}

export default new TaskTypeService()