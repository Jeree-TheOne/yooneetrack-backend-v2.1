import { db } from "../Utils/db"

import SocketService from './Socket'
import TagService from './Tag'
import TaskTypeService from './TaskType'
import ColumnService from './Column'
import RowService from './Row'
import MemberService from './Member'
import DeskService from './Desk'

import Workspace from "../Models/Workspace"
import WorkspaceWithData from "../Models/WorkspaceWithData"

/** Service for work with Workspace */
class WorkspaceService {

  /**
   * Creating a workspace method
   * @param {string} name workspace name
   * @param {string} userId creator of the workspace 
   * @returns {Workspace} created workspace
   */
  async create(name: string, userId: string): Promise<Workspace> {
    return await db.workspace.create({ 
      data: { 
        name,
        columns: { 
          create: [
            { name: 'New' },
            { name: 'In process' },
            { name: 'Done' },
          ]
        },
        rows: { 
          create: [
            { name: 'Tasks'}
          ]
        },
        tags: {
          create: [
            { name: 'Important', background: '#FF0000', color: '#000000' }
          ]
        },
        desks: {
          create: [
            { name: 'Desk', isCurrent: true }
          ]
        },
        taskTypes: {
          create: [
            { name: 'Task' }
          ]
        },
        members: {
          create: [
            { userId, role: 'CREATOR', isActivated: true }
          ]
        }
      },
    })
  }

  /**
   * Getting all workspaces that available to the user
   * @param {string} userId user id 
   * @returns {Workspace[]} workspaces available to the user
   */
  async selectAvailable(userId: string): Promise<Workspace[]>{
    return await db.workspace.findMany({ where: { members: { some: { userId } } } })
  }

  /**
   * Select workspace by id
   * @param {string} id workspace id
   * @returns {WorkspaceWithData} workspace with information about rows, columns and etc.
   */
  async selectOne(id: string): Promise<WorkspaceWithData> {
    const [workspace, tags, rows, columns, members, taskTypes, desks] = await Promise.all([
      await db.workspace.findFirst({ 
        where: { id },
        select: {
          id: true,
          name: true
        }
      }),
      TagService.selectFromWorkspace(id),
      RowService.selectFromWorkspace(id),
      ColumnService.selectFromWorkspace(id),
      MemberService.selectFromWorkspace(id),
      TaskTypeService.selectFromWorkspace(id),
      DeskService.selectFromWorkspace(id),
    ])

    return {
      ...workspace,
      tags,
      rows,
      columns,
      members,
      taskTypes,
      desks
    }
  }
  /**
   * Updating workspace name method
   * @param {string} id workspace id 
   * @param {string} name workspace name 
   */
  async update(id: string, name: string): Promise<void> {
    const workspace = await db.workspace.update({ where: { id } , data: { name } })
    SocketService.updateWorkspace(workspace)
  }

  /**
   * Deleting workspace method
   * @param {string} id workspace id 
   */
  async delete(id: string): Promise<void> {
    await db.workspace.delete({ where: { id } })
  }
}

export default new WorkspaceService()