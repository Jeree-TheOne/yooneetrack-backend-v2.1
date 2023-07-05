import jwt, { Secret } from 'jsonwebtoken';


import Token from "../Models/Token";
import User from "../Models/User";
import { db } from '../Utils/db';

/** Service for work with Tokens */

class TokenService {

  /**
   * Method to tokenize a user data
   * @param {User} payload user data which should be tokenized 
   * @returns {Token} tokenized user data
   */
  generateToken(payload: User): Token {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as Secret, {expiresIn: '15d'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as Secret, {expiresIn: '30d' })
    return {
      accessToken,
      refreshToken
    }
  }

  /**
   * Method to save a user token
   * @param {string} userId user id
   * @param {string} userAgent user agent
   * @param {string} refreshToken user's refresh token
   */
  async saveToken(userId: string, userAgent: string, refreshToken: string): Promise<void> {
    await db.token.upsert({
      where: {
        tokenUnique: {
          userId,
          userAgent
        }
      },
      update: {
        refreshToken
      },
      create: {
        userId,
        userAgent,
        refreshToken
      }
    })
  }

  /**
   * Method to remove token from the database
   * @param {string} userId user id 
   * @param {string} userAgent user agent 
   */
  async removeToken(userId: string, userAgent: string): Promise<void> {
    await db.token.deleteMany({ where: { AND: { userId, userAgent } } })
  }

  /**
   * Method to validate access token
   * @param {string} accessToken access token
   * @returns {T | null} returns value if token is valid
   */
  validateAccessToken<T>(accessToken: string): T | null {
    try {
      return jwt.verify(accessToken.split(' ')[1], process.env.JWT_ACCESS_SECRET as Secret) as T
    } catch (e) {
      return null
    }
  }

  /**
   * Method to validate refresh token
   * @param {string} refreshToken refresh token
   * @returns {T | null} returns value if token is valid
   */
  validateRefreshToken<T>(refreshToken: string): T | null {
    try {
      return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as Secret) as T
    } catch (e) {
      return null
    }
  }

  /**
   * Method to get token from database
   * @param {string} refreshToken refresh token 
   * @returns token object from the database
   */
  async tokenFromDb(refreshToken: string) {
    return db.token.findFirst({ where: { refreshToken } })
  }
}

export default new TokenService();