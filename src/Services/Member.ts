import { db } from "../Utils/db"

import ApiError from "../Exceptions/ApiError"
import SocketService from './Socket'
import Member from "../Models/Member"
import EmailService from "./Email"

/** Service for work with Members */

class MemberService {
  
  /**
   * Adding member to workspace method
   * @param {string} userId user id
   * @param {string} workspaceId workspace id
   * @param {string} roleId role id
   */
  async add(email: string, workspaceId: string): Promise<void> {
    const [{ name }, { id: userId }] = await Promise.all([
      db.workspace.findFirst({ where: { id: workspaceId } }),
      db.user.findFirst({ where: { email } })
    ])
    await db.member.create({ data: { userId, workspaceId } })


    EmailService.sendWorkspaceInvitationMail(email, `${process.env.API_URL}/api/member/activate/${workspaceId}/${userId}`, name)
  }

  /**
   * Updating member method
   * @param {string} userId user id
   * @param {string} workspaceId workspace id
   * @param {string} roleId role id
   */
  async update(userId: string, workspaceId: string, role: 'USER' | 'ADMIN' | 'CREATOR' | 'VIEWER' ): Promise<void> {
    const id = await this.isMemberExists(userId, workspaceId)
    await db.member.update({ where: { id }, data: { role } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Block member method
   * @param {string} id user id
   * @param {string} workspaceId role id
   */
  async blockMember(userId: string, workspaceId: string): Promise<void> {
    const id = await this.isMemberExists(userId, workspaceId)
    const { isBlocked } = await db.member.findFirst({ where: { id } })
    await db.member.update({ where: { id }, data: { isBlocked: !isBlocked } })
    this.sendChangeSocket(workspaceId, id, isBlocked ? 'create' : 'delete')
  }

  /**
   * Activate member method
   * @param {string} id user id
   * @param {string} workspaceId role id
   */
  async activateMember(userId: string, workspaceId: string): Promise<void> {
    const id = await this.isMemberExists(userId, workspaceId)

    await db.member.update({ where: { id }, data: { isActivated: true } })
    this.sendChangeSocket(workspaceId, id, 'create')
  }

  /**
   * Check if user has access to workspace
   * @param {string} id user id
   * @param {string} workspaceId role id
   * @returns {boolean} is user has access to workspace
   */
  async isWorkspaceAvailable(userId: string, workspaceId: string): Promise<boolean> {
    const member = await db.member.findFirst({ where: { AND: [ { workspaceId }, { userId }, { isBlocked: false }, { isActivated: true} ] } })
    if (member) return true
    return false
  }

  /**
   * Check if user exists in workspace
   * @param {string} id user id
   * @param {string} workspaceId role id
   * @returns {string} member id
   */
  async isMemberExists(userId: string, workspaceId: string): Promise<string> {
    const member = await db.member.findFirst({ where: { userId, workspaceId } })
    if (!member) throw ApiError.BadRequest('Этот пользователь не является участником данного рабочего пространства')
    return member.id
  }

  /**
   * Select all members which have access to the workspace
   * @param workspaceId workspace id
   * @returns {Member[]} workspace members which have access to the workspace
   */
  async selectFromWorkspace(workspaceId: string): Promise<Member[]> {
    const membersRaw = await db.member.findMany({ 
      where: { workspaceId, isActivated: true, isBlocked: false  },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            login: true,
            firstName: true,
            secondName: true,
            image: {
              select: {
                path: true
              }
            }
          }
        }
      }
    })
    const members = membersRaw.map(member => { 
      const { user, role } = member
      const { id, email, login, firstName, secondName, image } = user
      const { path: avatar } = image
      return {
        id, email, login, firstName, secondName, role, avatar
      } 
    })
    return members
  }

  /**
   * Getting all members of a workspace
   * @param {string} workspaceId workspace id 
   * @returns {Member[]} returns all members of a workspace
   */
  async selectAllMembers(workspaceId: string): Promise<Member[]> {
    const members = await db.member.findMany({
      where: { workspaceId },
      select: {
        id: true,
        role: true,
        isBlocked: true,
        isActivated: true,
        user: {
          select: {
            id: true,
            email: true,
            login: true,
            firstName: true,
            secondName: true,
            image: {
              select: {
                path: true
              }
            }
          }
        }
      }
    })

    return members.map(member => { 
      const { user, role, isBlocked, isActivated } = member
      const { id, email, login, firstName, secondName, image } = user
      const { path: avatar } = image
      return {
        id, email, isBlocked, isActivated, login, firstName, secondName, role, avatar
      } 
    })
  }

  /**
   * Select one member who has access to the workspace
   * @param {string} memberId member id
   * @returns {Member} member data who has access to the workspace
   */
  async selectOne(memberId: string): Promise<Member> {
    const member = await db.member.findFirst({ 
      where: { id: memberId },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            login: true,
            firstName: true,
            secondName: true,
            image: {
              select: {
                path: true
              }
            }
          }
        }
      }
    })

    const { user, role } = member
    const { id, email, login, firstName, secondName, image } = user
    const { path: avatar } = image
    return {
      id, email, login, firstName, secondName, role, avatar
    } 
  }

  /**
   * Method to update members data by socket
   * @param {string} workspaceId workspace id
   * @param {string} columnId member id
   * @param {'update' | 'create' | 'delete'} action action, which happened with member
   */
  async sendChangeSocket(workspaceId: string, memberId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const member = await this.selectOne(memberId)
    SocketService.updateMembers(workspaceId, member, action)
  }
}

export default new MemberService()