import Tag from "../Models/Tag"
import { db } from "../Utils/db"
import SocketService from './Socket'

/** Service for work with Tags */

class TagService {

  /**
   * Adding a new tag to workspace method
   * @param {string} name tag name
   * @param {string} background tag background color
   * @param {string} color tag font color
   * @param {string} workspaceId workspace id
   */
  async create(name: string, background: string, color: string, workspaceId: string): Promise<void> {
    const { id } = await db.tag.create({ data: { name, background, color, workspaceId } })
    this.sendChangeSocket(workspaceId, id, 'create')
  }

  /**
   * Updating a tag method
   * @param {string} id tag id
   * @param {string} name tag name
   * @param {string} background tag background color
   * @param {string} color tag font color
   */
  async update(id: string, name: string, background: string, color: string): Promise<void> {
    const { workspaceId } = await db.tag.update({ where: { id } , data: { name, background, color } })
    this.sendChangeSocket(workspaceId, id)
  }

  /**
   * Delete a tag method
   * @param {string} id tag id
   */
  async delete(id: string): Promise<void> {
    const { workspaceId } = await db.tag.delete({ where: { id }})
    this.sendChangeSocket(workspaceId, id, 'delete')
  }

  /**
   * Getting tags of a workspace
   * @param {string} workspaceId workspace id
   * @returns {Tag[]} tags of a workspace
   */
  async selectFromWorkspace(workspaceId: string): Promise<Tag[]> {
    const tags = await db.tag.findMany({ 
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        background: true,
        color: true
      }
    })
    return tags
  }

  /**
   * Getting tag by id
   * @param {string} tagId tag id
   * @returns {Tag} tag instance
   */
  async selectOne(tagId: string): Promise<Tag> {
    const tag = await db.tag.findFirst({ 
      where: { id: tagId },
      select: {
        id: true,
        name: true,
        background: true,
        color: true
      }
    })

    return tag
  }

  /**
   * Method to update tag data by socket
   * @param {string} workspaceId workspace id
   * @param {string} tagId tag id
   * @param {'update' | 'create' | 'delete'} action action, which happened with column
   */
  async sendChangeSocket(workspaceId: string, tagId: string, action: 'update' | 'create' | 'delete' = 'update'): Promise<void> {
    const tag = action == 'delete' ? { id: tagId } as Tag : await this.selectOne(tagId);
    SocketService.updateTags(workspaceId, tag, action)
  }
}

export default new TagService()