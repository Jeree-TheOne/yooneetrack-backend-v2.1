import PersonalTaskService from "../Services/PersonalTask"
import FileService from "../Services/File"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"
import { uploadFiles } from "../Utils/multer"

/** Personal tasks controller */
class PersonalTaskController {

  /**
   * PErsonal task create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    try {
      uploadFiles(req, res, async (err) => {
        if (err) return ApiError.BadRequest(err.message) 
        const { title, description, isImportant, isUrgent, deadline  } = req.body
        const { id } = req.user
        if (!title) return ApiError.BadRequest('Заголовок не может быть пустым')
        const files = req.files ? await FileService.upload((req.files as Express.Multer.File[]).map(file => file.path)) : []
        await PersonalTaskService.create(id, title, description, isImportant, isUrgent, deadline, files)
        return res.status(200).send()
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Personal task update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    try {
      uploadFiles(req, res, async (err) => {
        if (err) return ApiError.BadRequest(err.message) 
        const { title, description, isImportant, isUrgent, isDone, deadline  } = req.body
        const { id } = req.params
        if (!title) return ApiError.BadRequest('Заголовок не может быть пустым')
        const files = req.files ? await FileService.upload((req.files as Express.Multer.File[]).map(file => file.path)) : []
        await PersonalTaskService.update(id, title, description, isImportant, isUrgent, isDone, deadline, files)
        return res.status(200).send()
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Selecting all personal tasks endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async selectAll(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      const tasks = await PersonalTaskService.select(id)
      return res.status(200).json(tasks)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Personal task delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      await PersonalTaskService.delete(id)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new PersonalTaskController()