import { Router } from "express";
import {
  advanceUserTextSearch,
  advanceDataTextSearch,
  advanceTextSearchPage,
  advanceTextSearchPageDefault,
} from "../controllers/user";

const router = Router();

router.post("/user", advanceUserTextSearch);
router.post("/data", advanceDataTextSearch);
router.post("/data/page", advanceTextSearchPage);
router.post("/data/page/default", advanceTextSearchPageDefault);

export default router;
