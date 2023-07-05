import WorkspaceService from "../Services/Workspace"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"

/** Workspace controller */
class WorkspaceController {

  /**
   * Select all available workspaces endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async selectAll(req: CustomRequest, res: Response, next: Function) {
    try {
      const { id } = req.user
      const workspaces = await WorkspaceService.selectAvailable(id)
      return res.status(200).json(workspaces)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Select workspace by id with its data endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async selectOne(req: CustomRequest, res: Response, next: Function) {
    try {
      const { id } = req.params
      const workspace = await WorkspaceService.selectOne(id)
      return res.status(200).json(workspace)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Workspace create endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async create(req: CustomRequest, res: Response, next: Function): Promise<Response>{
    try {
      const { name } = req.body
      const { id: userId } = req.user
      if (!name) throw ApiError.BadRequest('Не указано название рабочего пространства')
      const { id } = await WorkspaceService.create(name, userId)
      return res.status(200).json({ id })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Workspace update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    try {
      const { workspace: id } = req
      const { name } = req.body
      
      await WorkspaceService.update(id, name)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Workspace delete endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    try {
      const { workspace: id } = req

      await WorkspaceService.delete(id)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new WorkspaceController()