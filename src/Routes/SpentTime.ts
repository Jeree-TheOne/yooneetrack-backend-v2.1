import { Router } from "express"
import SpentTimeController from "../Controllers/SpentTime"

const router = Router();

router.post('/:id/', SpentTimeController.create)
router.put('/:id/:spentTimeId', SpentTimeController.update)
router.delete('/:id/:spentTimeId', SpentTimeController.delete) 

export default router