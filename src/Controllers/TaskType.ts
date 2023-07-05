import TaskTypeService from "../Services/TaskType"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"

/** Task type controller */
class TaskTypeController {

  /**
   * Task type create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    const { name } = req.body
    const { workspace } = req
    try {
      if (!name) return ApiError.BadRequest('Не указано название типа задачи')
      await TaskTypeService.create(name, workspace)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Task type update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    const { name } = req.body
    try {
      await TaskTypeService.update(id, name)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * TAsk type delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      await TaskTypeService.delete(id)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new TaskTypeController()