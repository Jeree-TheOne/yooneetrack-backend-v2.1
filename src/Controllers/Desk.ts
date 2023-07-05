import DeskService from "../Services/Desk"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"
import TaskService from "../Services/Task"

/** Desk controller */
class DeskController {

  /**
   * Select a desk with tasks by id endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async selectOne(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      const desk = await DeskService.selectOne(id)
      const tasks = await TaskService.selectFromDesk(desk.id)
      return res.status(200).json({
        ...desk,
        tasks
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Desk create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    const { name, isCurrent } = req.body
    const { workspace } = req
    try {
      if (!name) return ApiError.BadRequest('Не указано название доски')
      await DeskService.create(name, workspace, isCurrent)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Desk update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    const { name } = req.body
    try {
      await DeskService.update(id, name)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Set desk current endpoint endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async setCurrent(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    const { workspace } = req
    try {
      await DeskService.setCurrent(id, workspace)
      res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Desk delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      await DeskService.delete(id)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new DeskController()