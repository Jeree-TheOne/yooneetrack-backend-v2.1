import { Router } from "express"
import CommentController from "../Controllers/Comment"

const router = Router();

router.post('/:id', CommentController.create)
router.put('/:id/:commentId', CommentController.update)
router.delete('/:id/:commentId', CommentController.delete)

export default router