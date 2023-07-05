import CommentService from "../Services/Comment"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"

/** Comment controller */
class CommentController {

  /**
   * Comment create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    const { id: taskId } = req.params
    const { id } = req.user
    const { text } = req.body
    try {
      await CommentService.create(taskId, id, text)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Comment update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    const { id: taskId, commentId } = req.params
    const { text } = req.body
    try {
      const isCommentIdValid = await CommentService.isTaskHasComment(taskId, commentId)
      if (!isCommentIdValid) ApiError.BadRequest('Ошибка в индексах сущностей')
      await CommentService.update(commentId, text)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Comment delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id: taskId, commentId } = req.params
    try {
      const isCommentIdValid = await CommentService.isTaskHasComment(taskId, commentId)
      if (!isCommentIdValid) ApiError.BadRequest('Ошибка в индексах сущностей')
      await CommentService.delete(commentId)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new CommentController()