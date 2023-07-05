import MemberService from "../Services/Member"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

/** Member controller */
class MemberController {

  /**
   * Member adding endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async add(req: CustomRequest, res: Response, next: Function) {
    const { workspace } = req
    const { email } = req.body
    try {
      await MemberService.add(email, workspace)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Member update endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    const { role } = req.body
    const { workspace } = req
    try {
      await MemberService.update(id, workspace, role)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Block member endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async block(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    const { workspace } = req
    try {
      await MemberService.blockMember(id, workspace)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  /**
   * Activate member endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async activate(req: CustomRequest, res: Response, next: Function) {
    const { id, workspaceId } = req.params
    try {
      await MemberService.activateMember(id, workspaceId)
      return res.redirect(`${process.env.CLIENT_URL as string}/workspace/${workspaceId}`)
    } catch (e) {
      next(e)
    }
  }
}

export default new MemberController()