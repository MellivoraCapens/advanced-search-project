import { Router } from "express";
import {
  advanceUserTextSearch,
  advanceDataTextSearch,
} from "../controllers/user";

const router = Router();

router.post("/user", advanceUserTextSearch);
router.post("/data", advanceDataTextSearch);

export default router;
