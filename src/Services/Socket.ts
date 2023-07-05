import Column from '../Models/Column'
import Desk from '../Models/Desk';
import Member from '../Models/Member';
import PersonalTask from '../Models/PersonalTask';
import Row from '../Models/Row';
import Tag from '../Models/Tag';
import Task from '../Models/Task';
import TaskType from '../Models/TaskType';
import Workspace from '../Models/Workspace';
import socket from '../socket'
import Comment from '../Models/Comment';
import History from '../Models/History';
import SpentTime from '../Models/SpentTime';

class SocketService {
  updateWorkspace(workspace: Workspace) {
    socket.to(workspace.id).emit('updateWorkspace', workspace);
  }

  updateDesks(workspaceId: string, desk: Desk, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(workspaceId).emit('updateSettings', { desk, action });
  }

  updateRows(workspaceId: string, row: Row, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(workspaceId).emit('updateSettings', { row, action });
  }

  updateColumns(workspaceId: string, column: Column, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(workspaceId).emit('updateSettings', { column, action });
  }

  updateTags(workspaceId: string, tag: Tag, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(workspaceId).emit('updateSettings', { tag, action });
  }

  updateTaskTypes(workspaceId: string, taskType: TaskType, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(workspaceId).emit('updateSettings', { taskType, action });
  }

  updateMembers(workspaceId: string, member: Member, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(workspaceId).emit('updateSettings', { member, action });
  }

  updateTasks(deskId: string, task: Task, action: 'update' | 'create' | 'delete' = 'update') {
    console.log(task);
    socket.to(deskId).emit('updateTasks', { task, action });
  }

  updateTask(taskId: string, task: Task, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(taskId).emit('updateTask', { task, action });
  }

  updateTaskWall(taskId: string, taskWallItem: SpentTime | Comment | History, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(taskId).emit('updateTaskWall', { taskWallItem, action })
  }

  updatePersonalTasks(userId: string, task: PersonalTask, action: 'update' | 'create' | 'delete' = 'update') {
    socket.to(userId).emit('updatePersonalTasks', { task, action });
  }
}

export default new SocketService();