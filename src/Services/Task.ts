import { db } from "../Utils/db"

import SocketService from './Socket'

import HistoryService from "../Services/History"
import CommentService from "../Services/Comment"
import SpentTimeService from "../Services/SpentTime"

import Task from "../Models/Task"
import History from "../Models/History"
import Comment from "../Models/Comment"
import SpentTime from "../Models/SpentTime"

/** Service for work with Tasks */

class TaskService {

  /**
   * Creating a new task method
   * @param {string} title task title
   * @param {string} description task description
   * @param {string} authorId task author
   * @param {string} rowId task row id
   * @param {string} columnId task column id
   * @param {string} deskId task desk id
   * @param {string} taskTypeId task type id
   * @param {number?} initialAssessment initial assessment
   * @param {string?} performerId performer id
   * @param {string[]} tagsId tags ids
   * @param {string[]} files files attached to the task
   */
  async create(title: string, description: string, authorId: string, rowId: string, columnId: string, deskId: string, taskTypeId: string, initialAssessment = 0, performerId = null as string, tagsId = [] as string[], files = [] as string[]): Promise<void> {
    const task = await db.task.create({
      data: { 
        title, description, authorId, rowId, columnId, deskId, taskTypeId, initialAssessment: Number(initialAssessment), performerId,
        tags: { connect: tagsId.map(tag => { return { id: tag } }) },
        files: { connect: files.map(file => { return { id: file } }) }
      }
    })
    this.sendTasksChangeSocket(deskId, task.id, 'create')
  }

  /**
   * Updating the task method
   * @param {string} id task id
   * @param {string} updaterId updater id
   */
  async update(id: string, updaterId: string) {
    await db.task.update({
      where: { id },
      data: { updaterId, updatedAt: new Date(Date.now()),}
    })
  }

  /**
   * Updating the task title method
   * @param {string} id task id
   * @param {string} title title
   */
  async updateTitle(id: string, title: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { title }
    })
  }

  /**
   * Updating the task description method
   * @param {string} id task id
   * @param {string} description description
   */
  async updateDescription(id: string, description: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { description }
    })
  }

  /**
   * Updating the task files method
   * @param {string} id task id
   * @param {string[]} files files ids
   */
  async updateFiles(id: string, files = [] as string[]): Promise<void> {
    await db.task.update({
      where: { id },
      data: { files: { set: files.map(file => { return { id: file } }) }  }
    })
  }

  /**
   * Updating the task tags method
   * @param {string} id task id
   * @param {string[]} tags tags id
   */
  async updateTags(id: string, tags = [] as string[]): Promise<void> {
    await db.task.update({
      where: { id },
      data: { tags: { set: tags.map(tag => { return { id: tag } }) }  }
    })
  }

  /**
   * Updating the task initial assessment method
   * @param {string} id task id
   * @param {string} initialAssessment initial assessment
   */
  async updateInitialAssessment(id: string, initialAssessment: number): Promise<void> {
    await db.task.update({
      where: { id },
      data: { initialAssessment: Number(initialAssessment) }
    })
  }

  /**
   * Updating the task performer method
   * @param {string} id task id
   * @param {string} performerId performer id
   */
  async updatePerformerId(id: string, performerId: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { performerId }
    })
  }

  /**
   * Updating the task row method
   * @param {string} id task id
   * @param {string} rowId row id
   */
  async updateRowId(id: string, rowId: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { rowId }
    })
  }

  /**
   * Updating the task column method
   * @param {string} id task id
   * @param {string} columnId column id
   */
  async updateColumnId(id: string, columnId: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { columnId }
    })
  }

  /**
   * Updating the task type method
   * @param {string} id task id
   * @param {string} taskTypeId task type id
   */
  async updateTaskTypeId(id: string, taskTypeId: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { taskTypeId }
    })
  }

  /**
   * Updating the task desk method
   * @param {string} id task id
   * @param {string} deskId desk id
   */
  async updateDeskId(id: string, deskId: string): Promise<void> {
    await db.task.update({
      where: { id },
      data: { deskId }
    })
  }

  /**
   * Get updatable fields of task with previous data
   * @param {string} id task id
   */
  async getTaskUpdatable(id: string) {
    const task = await db.task.findFirst({
      where: { id },
      select: {
        title: true,
        description: true,
        initialAssessment: true,
        performerId: true,
        rowId: true,
        columnId: true,
        deskId: true,
        taskTypeId: true,
        tags: { select: { id: true } },
        files: { select: { id: true } },
      }
    })

    const { tags, files, ...data } = task
    return {
      ...data,
      tags: tags.map(tag => tag.id),
      files: files.map(file => file.id),
    }
  }

  /**
   * Selecting task by id
   * @param {string} id task id
   * @returns {Task} task instance
   */
  async getTask(id: string): Promise<Task> {
    const [task, spentTime] = await Promise.all([
      db.task.findFirst({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          initialAssessment: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          updaterId: true,
          performerId: true,
          rowId: true,
          columnId: true,
          taskTypeId: true,
          deskId: true,
          tags: { select: { id: true } },
          files: { select: { path: true } }
        }
      }),
      SpentTimeService.getSpentTimeOfTask(id)
    ])

    const { tags, files, ...data } = task

    return {
      ...data,
      spentTime,
      tags: tags.map(tag => tag.id),
      files: files.map(file => file.path)
    }
  }

  /**
   * Getting task wall by id
   * @param {string} id task id 
   * @returns {(History | Comment | SpentTime)[]} sorted list of task wall instances
   */
  async getTaskWall(id: string): Promise<(History | Comment | SpentTime)[]> {
    const [histories, comments, spentTime] = await Promise.all([
      HistoryService.getAllHistories(id),
      CommentService.getAllComments(id),
      SpentTimeService.getAllSpentTimes(id)
    ])

    const wall = [...histories, ...comments, ...spentTime] as Array<History | Comment | SpentTime>
    return wall.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  /**
   * Deleting task method
   * @param {string} id task id 
   */
  async delete(id: string): Promise<void> {
    const { deskId } = await db.task.delete({ where: { id }})
    this.sendTasksChangeSocket(deskId, id, 'delete')
  }

  /**
   * Selecting all tasks of a desk
   * @param {string} deskId desk id 
   * @returns {Task[]} tasks of a desk
   */
  async selectFromDesk(deskId: string): Promise<Task[]> {
    const tasks = await db.task.findMany({ 
      where: { deskId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        initialAssessment: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        updaterId: true,
        performerId: true,
        rowId: true,
        columnId: true,
        taskTypeId: true,
        deskId: true,
        spentTime: { select: { spentTime: true } },
        tags: { select: { id: true } },
        files: { select: { path: true } }
      } 
    })

    return tasks.map((task) => {
      const { tags, files, spentTime, ...data } = task
      return {
      ...data,
        spentTime: spentTime.reduce((acc, curr) => acc += curr.spentTime, 0),
        tags: tags.map(tag => tag.id),
        files: files.map(file => file.path),
      }
    })
  }

  /**
   * Method to update desks tasks data by socket
   * @param {string} deskId desk id
   * @param {string} taskId task id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendTasksChangeSocket(deskId: string, taskId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const task = action == 'delete' ? { id: taskId } as Task : await this.getTask(taskId);
    SocketService.updateTasks(deskId, task, action)
  }

  /**
   * Method to update opened task data by socket
   * @param {string} taskId task id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendTaskChangeSocket(taskId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const task = action == 'delete' ? { id: taskId } as Task : await this.getTask(taskId);
    SocketService.updateTask(taskId, task, action);
  }
}

export default new TaskService()