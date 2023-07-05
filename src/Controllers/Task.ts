import TaskService from "../Services/Task"
import HistoryService from "../Services/History"
import CommentService from "../Services/Comment"
import SpentTimeService from "../Services/SpentTime"
import FileService from "../Services/File"
import { Response } from "express"
import CustomRequest from "../Models/CustomRequest"

import ApiError from "../Exceptions/ApiError"
import { uploadFiles } from "../Utils/multer"
import { capitalizeFirstLetter } from "../Utils/formatters"

/** Task controller */
class TaskController {

  /**
   * Task create endpoint
   * @param {CustomRequest} req Request object
   * @param {Response} res Response object
   * @param {Function} next  
   */
  async create(req: CustomRequest, res: Response, next: Function) {
    try {
      uploadFiles(req, res, async (err) => {
        if (err) return ApiError.BadRequest(err.message) 
        const { title, description, rowId, columnId, deskId, taskTypeId, initialAssessment, performerId } = req.body
        const { id: authorId } = req.user
        if (!title) return ApiError.BadRequest('Заголовок не может быть пустым')
        const tags = req.body.tags ? Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags] : []
        const files = req.files ? await FileService.upload((req.files as Express.Multer.File[]).map(file => file.path)) : []
        await TaskService.create(title, description, authorId, rowId, columnId, deskId, taskTypeId, initialAssessment, performerId, tags, files )
        return res.status(200).send()
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Task update endpoint
   * @param {CustomRequest} req Request object
   * @param {Response} res Response object
   * @param {Function} next  
   */
  async update(req: CustomRequest, res: Response, next: Function) {
    try {
      uploadFiles(req, res, async (err) => {
        if (err) return ApiError.BadRequest(err.message) 
        else if (req.files) {
          const { id } = req.params
          const { id: userId } = req.user
          const tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]
          const files = await FileService.upload((req.files as Express.Multer.File[]).map(file => file.path))

          const oldTask = await TaskService.getTaskUpdatable(id)

          const updatedFields = []
          const fieldsValues = []
          const previousValues = []

          Object.keys(req.body).forEach(key => {
            if (key === 'tags') return
            if (oldTask[key] === undefined) return ApiError.BadRequest(`Поле ${key} недопустимо`)
            if (oldTask[key] == req.body[key]) return
            
            updatedFields.push(key)
            fieldsValues.push(req.body[key])
            previousValues.push(oldTask[key])
          })

          if (oldTask.files.toString() !== files.toString()) {
            updatedFields.push('files')
            fieldsValues.push(files)
            previousValues.push(oldTask.files)
          } 

          if (oldTask.tags.toString() !== tags.toString()) {
            updatedFields.push('tags')
            fieldsValues.push(tags.toString().length ? tags : [])
            previousValues.push(oldTask.tags)
          } 
          if (!updatedFields.length) return res.status(200).send()

          HistoryService.create(id, userId, updatedFields, fieldsValues, previousValues)

          TaskService.update(id, userId)

          await Promise.all(updatedFields.map((field, index) => TaskService[`update${capitalizeFirstLetter(field)}`](id, fieldsValues[index])))
          
          await TaskService.sendTasksChangeSocket(req.body.deskId || oldTask.deskId, id)
          await TaskService.sendTaskChangeSocket(id)
          return res.status(200).send()
        }
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Select task by id endpoint
   * @param {CustomRequest} req Request object
   * @param {Response} res Response object
   * @param {Function} next  
   */
  async select(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      const [task, spentTime] = await Promise.all([
        TaskService.getTask(id),
        SpentTimeService.getSpentTimeOfTask(id)
      ])
      return res.status(200).json({
        ...task,
        spentTime,
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Get task wall endpoint
   * @param {CustomRequest} req Request object
   * @param {Response} res Response object
   * @param {Function} next  
   */
  async wall(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      const wall = await TaskService.getTaskWall(id)
      return res.status(200).json(wall)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Task delete endpoint
   * @param {CustomRequest} req Request object
   * @param {Response} res Response object
   * @param {Function} next  
   */
  async delete(req: CustomRequest, res: Response, next: Function) {
    const { id } = req.params
    try {
      await TaskService.delete(id)
      await TaskService.sendTaskChangeSocket(id, 'delete')
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
}

export default new TaskController()