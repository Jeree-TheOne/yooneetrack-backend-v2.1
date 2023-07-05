import { Router } from "express"
import AuthController from "../Controllers/Auth"

const router = Router();

router.post('/registration', AuthController.registration)
router.post('/login', AuthController.login)
router.get('/activate/:link', AuthController.activate)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)

export default router