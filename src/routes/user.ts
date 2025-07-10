import { Router } from "express";
import {
  advanceUserTextSearch,
  advanceDataTextSearch,
  advanceTextSearchPage,
} from "../controllers/user";

const router = Router();

router.post("/user", advanceUserTextSearch);
router.post("/data", advanceDataTextSearch);
router.post("/data/page", advanceTextSearchPage);

export default router;
