import ApiError from "../Exceptions/ApiError"
import { db } from "../Utils/db"
import User from "../Models/User"
import UserWithPassword from "../Models/UserWithPassword"

import AuthService from "../Services/Auth"
import TokenData from "../Models/TokenData"

import bcrypt from 'bcrypt'

/** Service for work with User */

class UserService {

  /**
   * Method to find if a user exists in the database
   * @param {string} loginOrEmail login or email
   * @returns {UserWithPassword | null} user info
   */
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserWithPassword | null> {
    const user = await db.user.findFirst({ 
      where: { OR: [ { email: loginOrEmail }, { login: loginOrEmail } ] },
      include: {
        image: {
          select: {
            path: true
          }
        }
      },
    })
    if (!user) return null

    const { imageId, image, ...rest} = user

    if (!image) return {
      ...rest,
      avatar: undefined,
    } as UserWithPassword

    return {
      ...rest,
      avatar: image.path
    } as UserWithPassword
  }

  /**
   * Getting user by id
   * @param {string} id user id 
   * @returns {UserWithPassword | null} user info
   */
  async findById(id: string): Promise<UserWithPassword | null> {
    const user = await db.user.findFirst({ 
      where: { id },
      include: {
        image: {
          select: {
            path: true
          }
        }
      },
    })

    const { imageId, image, ...rest} = user

    return {
      ...rest,
      avatar: image.path
    } as UserWithPassword
  }

  /**
   * Method to change users profile picture
   * @param {string} id user id 
   * @param {string} imageId image id
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async changeAvatar(id: string, imageId: string, userAgent: string): Promise<TokenData> {
    const user = await db.user.update({
      where: { id },
      data: { imageId },
      include: {
        image: {
          select: {
            path: true
          }
        }
      }
    })

    const { image, imageId: _, ...rest} = user

    return AuthService.generateToken({
      ...rest,
      avatar: image.path
    } as UserWithPassword, userAgent)
  }

  /**
   * Method to remove users profile picture
   * @param {string} id user id
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async removeAvatar(id: string, userAgent: string): Promise<TokenData> {
    const user = await db.user.update({
      where: { id },
      data: { imageId: '21dee9ec-0e79-4dc0-9577-5052343f63fe' }, // default profile picture
      include: {
        image: {
          select: {
            path: true
          }
        }
      }
    })
    const { image, imageId, ...rest} = user

    return AuthService.generateToken({
      ...rest,
      avatar: image.path
    } as UserWithPassword, userAgent)
  }

  /**
   * Method to change users password
   * @param {string} id user id
   * @param {string} oldPassword old password
   * @param {string} newPassword new password
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async changePassword(id: string, oldPassword: string, newPassword: string, userAgent: string): Promise<TokenData> {
    try {
      const { password } = await db.user.findFirst({ where: { id } })
      const isPassEquals = await bcrypt.compare(oldPassword, password)
      if (!isPassEquals) throw ApiError.BadRequest('Неверный старый пароль')

      const hashNewPassword = await bcrypt.hash(newPassword, 10)
      await db.user.update({ where: { id }, data: { password: hashNewPassword } })
      const user = await this.findById(id)
      return AuthService.generateToken(user, userAgent)
    } catch (err) {
      throw ApiError.BadRequest()
    }
  }

  /**
   * Method to change users name
   * @param {string} id user id
   * @param {string} firstName user first name
   * @param {string} secondName user second name
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async changeName(id: string, firstName: string, secondName: string, userAgent: string): Promise<TokenData> {
    try {
      await db.user.update({ where: { id }, data: { firstName, secondName } })
      const user = await this.findById(id)
      return AuthService.generateToken(user, userAgent)
    } catch (e) {
      throw ApiError.BadRequest()
    }
  }

  /**
   * Method to change users login
   * @param {string} id user id
   * @param {string} login user login
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async changeLogin(id: string, login: string, userAgent: string): Promise<TokenData> {
    try {
      await db.user.update({ where: { id }, data: { login } })
      const user = await this.findById(id)
      return AuthService.generateToken(user, userAgent)
    } catch (e) {
      throw ApiError.BadRequest()
    }
  }

  /**
   * Method to block/unblock user in system
   * @param {string} id user id
   * @param {boolean} isBlocked should user be blocked
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async blockUser(id: string, isBlocked: boolean, userAgent: string): Promise<TokenData> {
    try {
      await db.user.update({ where: { id }, data: { isBlocked } })
      const user = await this.findById(id)
      return AuthService.generateToken(user, userAgent)
    } catch (e) {
      throw ApiError.BadRequest()
    }
  }

  /**
   * Method to make user become premium in system
   * @param {string} id user id
   * @param {boolean} isPremium should user be premium
   * @param {string} userAgent user agent
   * @returns {TokenData} users token data
   */
  async premiumUser(id: string, isPremium: boolean, userAgent: string): Promise<TokenData> {
    try {
      await db.user.update({ where: { id }, data: { isPremium } })
      const user = await this.findById(id)
      return AuthService.generateToken(user, userAgent)
    } catch (e) {
      throw ApiError.BadRequest()
    }
  }
}

export default new UserService()