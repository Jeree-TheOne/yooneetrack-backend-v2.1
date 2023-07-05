import RowService from "../Services/Row"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"

/** Row controller */
class RowController {

  /**
   * Row create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    const { name } = req.body
    const { workspace } = req
    try {
      if (!name) return ApiError.BadRequest('Не указано название категории')
      await RowService.create(name, workspace)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }


  /**
   * Row update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    const { name } = req.body
    try {
      await RowService.update(id, name)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Row delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      await RowService.delete(id)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new RowController()