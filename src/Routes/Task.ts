import { Router } from "express"
import TaskController from "../Controllers/Task"


import SpentTimeRouter from './SpentTime'
import CommentRouter from './Comment'

const router = Router();

router.get('/:id', TaskController.select)
router.get('/wall/:id', TaskController.wall)
router.post('/', TaskController.create)
router.put('/:id', TaskController.update)
router.delete('/:id', TaskController.delete)

router.use('/spent-time', SpentTimeRouter)
router.use('/comment', CommentRouter)


export default router