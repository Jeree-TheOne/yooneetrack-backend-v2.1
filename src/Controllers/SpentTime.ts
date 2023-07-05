import SpentTimeService from "../Services/SpentTime"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"

/** Spent time controller */
class SpentTimeController {

  /**
   * Spent time create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    const { id: taskId } = req.params
    const { id } = req.user
    const { spentTime } = req.body
    try {
      await SpentTimeService.create(taskId, id, spentTime)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Spent time update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    const { id: taskId, spentTimeId } = req.params
    const { spentTime } = req.body
    try {
      const isSpentTimeIdValid = await SpentTimeService.isTaskHasSpentTime(taskId, spentTimeId)
      if (!isSpentTimeIdValid) ApiError.BadRequest('Ошибка в индексах сущностей')
      await SpentTimeService.update(spentTimeId, spentTime)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Spent time delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id: taskId, spentTimeId } = req.params
    try {
      const isSpentTimeIdValid = await SpentTimeService.isTaskHasSpentTime(taskId, spentTimeId)
      if (!isSpentTimeIdValid) ApiError.BadRequest('Ошибка в индексах сущностей')
      await SpentTimeService.delete(spentTimeId)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new SpentTimeController()