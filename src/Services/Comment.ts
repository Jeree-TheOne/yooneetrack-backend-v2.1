import { db } from "../Utils/db"

import Comment from "../Models/Comment"

import SocketService from './Socket'

/** Service for work with Comments */

class CommentService {

  /**
   * Adding a new comment method
   * @param {string} taskId task id
   * @param {string} userId user, who wrote comment
   * @param {string} text comment text
   */
  async create(taskId: string, userId: string, text: string): Promise<void> {
    const { id } = await db.comment.create({ data: { taskId, userId, text } })
    this.sendChangeSocket(id, taskId, 'create')
  }

  /**
   * Updating comments text method
   * @param {string} id comment id
   * @param {string} text new comment text
   */
  async update(id: string, text: string): Promise<void> {
    const { taskId } = await db.comment.update({ 
      where: { id },
      data: { text } 
    })
    this.sendChangeSocket(id, taskId)
  }

  /**
   * Deleting comment method
   * @param {string} id comment id
   */
  async delete(id: string): Promise<void> {
    const { taskId } = await db.comment.delete({ where: { id } })
    this.sendChangeSocket(id, taskId, 'delete')
  }

  /**
   * Method to find out is comment belongs to a task
   * @param {string} taskId task id
   * @param {string} commentId comment id
   * @returns {boolean} is comment belongs to a task
   */
  async isTaskHasComment(taskId: string, commentId: string): Promise<boolean> {
    const comment = await db.comment.findFirst({ where: { taskId, id: commentId } })
    return !!comment
  }

  /**
   * Select comment by id
   * @param id comment id
   * @returns {Comment} comment instance
   */
  async selectOne(id: string): Promise<Comment> {
    const comment = await db.comment.findFirst({ 
      where: { id },
      select: {
        id: true,
        text: true,
        createdAt: true,
        userId: true
      } 
    })
    return {
      ...comment,
      type: 'comment'
    }
  }

  /**
   * Getting all comments of a task
   * @param {string} taskId task id
   * @returns {Comment[]} comments of a task
   */
  async getAllComments(taskId: string): Promise<Comment[]> {
    const comments = await db.comment.findMany({ 
      where: { taskId },
      select: {
        id: true,
        text: true,
        createdAt: true,
        userId: true
      }
    })
    return comments.map(comment => { 
      return {
        ...comment,
        type: 'comment'
      }
    })
  }

  /**
   * Method to update comment data by socket
   * @param {string} commentId spent time id
   * @param {string} taskId task id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendChangeSocket(commentId: string, taskId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const comment = action == 'delete' ? { id: commentId } as Comment : await this.selectOne(commentId);
    SocketService.updateTaskWall(taskId, comment, action)
  }
}

export default new CommentService()