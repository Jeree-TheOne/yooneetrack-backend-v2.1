import UserService from "../Services/User"
import FileService from "../Services/File"
import { Request, Response } from "express"
import { uploadAvatar } from "../Utils/multer"
import ApiError from "../Exceptions/ApiError"
import CustomRequest from "../Models/CustomRequest"

/** User controller  */
class UserController {

  /**
   * Upload profile picture endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async uploadAvatar(req: CustomRequest, res: Response, next: Function) {
    try {
      uploadAvatar(req, res, async (err) => {
        if (err) {
          return ApiError.BadRequest(err.message)
        } else if (req.file) {
          const userAgent = req.headers['user-agent']
          if (!userAgent) return res.status(300).send('Invalid user-agent')
          
          const { id, avatar } = req.user
          const imageId =  await FileService.uploadSingle(req.file.path)
          const data = await UserService.changeAvatar(id, imageId, userAgent)
          if (avatar !== 'images/avatar.jpg') await FileService.delete(avatar)
          return res.status(200).json(data)
        } else {
          return ApiError.BadRequest('Нет фотографии')
        }
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Remove profile picture endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async removeAvatar(req: CustomRequest, res: Response, next: Function) {
    try {
      const userAgent = req.headers['user-agent']
      if (!userAgent) return res.status(300).send('Invalid user-agent')
      const { id, avatar } = req.user
      const data = await UserService.removeAvatar(id, userAgent)
      if (avatar !== 'images/avatar.jpg') await FileService.delete(avatar)
      return res.status(200).json(data)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Change user name endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async changeName(req: CustomRequest, res: Response, next: Function) {
    try {
      const userAgent = req.headers['user-agent']
      if (!userAgent) return res.status(300).send('Invalid user-agent')

      const { id } = req.user
      const { firstName, secondName } = req.body
      const data = await UserService.changeName(id, firstName, secondName, userAgent)
      return res.status(200).json(data)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Change user login endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async changeLogin(req: CustomRequest, res: Response, next: Function) {
    try {
      const userAgent = req.headers['user-agent']
      if (!userAgent) return res.status(300).send('Invalid user-agent')

      const { id } = req.user
      const { login } = req.body
      const data = await UserService.changeLogin(id, login, userAgent)
      return res.status(200).json(data)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Block user endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async blockUser(req: CustomRequest, res: Response, next: Function) {
    try {
      const userAgent = req.headers['user-agent']
      if (!userAgent) return res.status(300).send('Invalid user-agent')

      const { id } = req.user
      const { isBlocked } = req.body
      const data = await UserService.blockUser(id, isBlocked, userAgent)
      return res.status(200).json(data)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Premium user endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async premiumUser(req: CustomRequest, res: Response, next: Function) {
    try {
      const userAgent = req.headers['user-agent']
      if (!userAgent) return res.status(300).send('Invalid user-agent')

      const { id } = req.user
      const { isPremium } = req.body
      const data = await UserService.premiumUser(id, isPremium, userAgent)
      return res.status(200).json(data)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Change user password endpoint
   * @param {CustomRequest} req request object
   * @param {Response} res response object
   * @param {Function} next callback function
   * @returns {Response} Response object
   */
  async changePassword(req: CustomRequest, res: Response, next: Function) {
    try {
      const userAgent = req.headers['user-agent']
      if (!userAgent) return res.status(300).send('Invalid user-agent')

      const { id } = req.user
      const { newPassword, oldPassword } = req.body
      if (newPassword === oldPassword) {
        next(ApiError.BadRequest('Новый пароль не должен совпадать со старым'))
      }
      const data = await UserService.changePassword(id, oldPassword, newPassword, userAgent)
      return res.status(200).json(data)
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController()