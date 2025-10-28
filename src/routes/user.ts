import { Router } from "express";
import {
  advanceUserTextSearch,
  advanceDataTextSearch,
  advanceTextSearchPage,
  advanceTextSearchPageDefault,
  createQuery,
  getQueryTitles,
  getQueriesInfo,
  getQueriedData,
} from "../controllers/user";

const router = Router();

router.post("/user", advanceUserTextSearch);
router.post("/data", advanceDataTextSearch);
router.post("/data/page", advanceTextSearchPage);
router.post("/data/page/default", advanceTextSearchPageDefault);
router.post("/query", createQuery);
router.get("/query-titles", getQueryTitles);
router.get("/queries", getQueriesInfo);
router.post("/get-queried-data", getQueriedData);

export default router;
