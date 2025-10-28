/// <reference path="../../@types/index.d.ts" />
import { Request, Response, NextFunction } from "express";
import Data from "../models/Data";
import Query from "../models/Query";
import { detailSearch } from "../utils/detailSearch";
import { handleDefaultDetail } from "../utils/handleDefaultDetail";
import { asyncHandler } from "../middlewares/asyncHandler";
import mongoose from "mongoose";

// @desc advance text search for user
// @route POST /advance-search/api/v1/user
// @access public
export const advanceUserTextSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body: any = req.body;

    const pipelineFunction = (body: any) => {
      const firstRadio = body.radioOutput === "and" ? "must" : "should";
      const pipeline: any = {
        $search: {
          index: body.index,
          compound: {
            [body.text.operator === "is" ? "must" : "mustNot"]: [
              {
                compound: {
                  should: [
                    {
                      text: {
                        query: body.text.query,
                        path: body.text.path,
                        matchCriteria: "all",
                        fuzzy: {
                          maxEdits: 2,
                        },
                      },
                    },
                    {
                      phrase: {
                        query: body.text.query,
                        path: body.text.path,
                        slop: 5,
                        score: {
                          boost: {
                            value: 2,
                          },
                        },
                      },
                    },
                  ],
                  minimumShouldMatch: 1,
                },
              },
            ],
            should: [
              {
                compound: {
                  [firstRadio]: [],
                },
              },
            ],
            minimumShouldMatch: 1,
          },
          sort: { score: { $meta: "searchScore", order: -1 } },
          highlight: {
            path: body.text.path,
          },
        },
      };
      if (body.radioOutput === "or") {
        pipeline.$search.compound.should[0].compound["minimumShouldMatch"] = 1;
      }

      for (let i = 0; i < body.columnCount; i++) {
        const column = body[`column${i}`];
        const secondRadio = column.radioOutput === "and" ? "must" : "should";
        pipeline.$search.compound.should[0].compound[firstRadio].push({
          compound: {
            [secondRadio]: [],
          },
        });
        if (secondRadio === "should") {
          pipeline.$search.compound.should[0].compound[firstRadio][i].compound[
            "minimumShouldMatch"
          ] = 1;
        }
        for (let j = 0; j < column.rowCount; j++) {
          const row = column[`row${j}`];
          const rowOp = row.operator === "is" ? "must" : "mustNot";
          let searchConfig: any = {
            compound: {
              [rowOp]: [
                {
                  text: {
                    query: row.query,
                    path: row.path,
                    fuzzy: {
                      maxEdits: 2,
                    },
                  },
                },
              ],
            },
          };

          if (row.path === "hobies" || row.path === "languages") {
            searchConfig.compound[rowOp][0] = {
              in: {
                path: row.path,
                value: row.query,
              },
            };
          }
          if (row.path === "role" || row.path === "company") {
            searchConfig.compound[rowOp][0] = {
              phrase: {
                query: row.query,
                path: row.path,
              },
            };
          }
          if (row.path === "birthdate" || row.path === "createdAt") {
            if (typeof row.query !== "string") {
              searchConfig.compound[rowOp][0] = {
                range: {
                  path: row.path,
                  gte:
                    row.query.from === null
                      ? new Date("1900-01-01")
                      : new Date(row.query.from),
                  lte:
                    row.query.to === null ? new Date() : new Date(row.query.to),
                },
              };
            }
          }

          if (row.path !== "default" || row.query !== "") {
            pipeline.$search.compound.should[0].compound[firstRadio][
              i
            ].compound[secondRadio].push(searchConfig);
          }
        }
      }

      return pipeline;
    };

    const data = await Data.aggregate([
      pipelineFunction(body),
      {
        $addFields: {
          highlights: {
            $meta: "searchHighlights",
          },
          score: {
            $meta: "searchScore",
          },
        },
      },
    ]);

    res.status(200).json({
      pipeline: pipelineFunction(body),
      body: body,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

// @desc advance text search for data(recursive)
// @route POST /advance-search/api/v1/data
// @access public
export const advanceDataTextSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: SearchDetailType = req.body;

      const pipeline: any = [
        {
          $search: {
            index: "advance",
            compound: {},
            highlight: {
              path: body.text.path,
            },
          },
        },
        {
          $addFields: {
            highlights: {
              $meta: "searchHighlights",
            },
            score: {
              $meta: "searchScore",
            },
          },
        },
        {
          $facet: {
            result: [
              {
                $limit: body.limit || 25,
              },
            ],
            total: [
              {
                $count: "count",
              },
            ],
          },
        },
      ];

      const textSearch = {
        [body.text.operator ? "must" : "mustNot"]: [
          {
            compound: {
              should: [
                {
                  text: {
                    query: body.text.query,
                    path: body.text.path,
                    matchCriteria: "all",
                    fuzzy: {
                      maxEdits: 1,
                    },
                  },
                },
                {
                  phrase: {
                    query: body.text.query,
                    path: body.text.path,
                    slop: 5,
                    score: {
                      boost: {
                        value: 2,
                      },
                    },
                  },
                },
              ],
              minimumShouldMatch: 1,
            },
          },
        ],
      };

      pipeline[0].$search.compound = textSearch;

      if (body.detailSearch) {
        pipeline[0].$search.compound["should"] = [
          {
            compound: detailSearch(body.search, body.field, body.operator),
          },
        ];
        pipeline[0].$search.compound["minimumShouldMatch"] = 1;
      }

      const data = await Data.aggregate(pipeline);
      const count = data[0].total[0] ? data[0].total[0].count : 0;

      res.status(200).json({
        success: true,
        data: data[0].result,
        count,
        isAtlas: true,
      });
    } catch (err) {
      const body: SearchDetailType = req.body;

      const pipeline: any = [
        {
          $match: {
            $and: [
              {
                $text: {
                  $search: body.text.query,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            score: { $meta: "textScore" },
          },
        },
        {
          $facet: {
            result: [
              {
                $skip: body.page ? body.page * (body.limit || 25) : 0,
              },
              {
                $limit: body.limit || 25,
              },
            ],
            total: [
              {
                $count: "count",
              },
            ],
          },
        },
      ];

      if (!body.text.operator) {
        pipeline.splice(1, 1);

        const matched = await Data.aggregate([
          pipeline[0],
          { $project: { _id: 1 } },
        ]);
        const idsToExclude = matched.map((doc) => doc._id);
        pipeline[0].$match.$and = [{ _id: { $nin: idsToExclude } }];
      }

      if (body.detailSearch) {
        pipeline[0].$match.$and.push(
          handleDefaultDetail(body.search, body.field, body.operator)
        );
      }

      const data = await Data.aggregate(pipeline);
      const count = data[0].total[0] ? data[0].total[0].count : 0;

      res.status(200).json({
        success: true,
        data: data[0].result,
        count,
        isAtlas: false,
      });
    }
  }
);

// @desc advance text search pagination for Atlas Search
// @route POST /advance-search/api/v1/data/page
// @access public
export const advanceTextSearchPage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body: SearchDetailType = req.body;

    const pipeline: any = [
      {
        $search: {
          index: "advance",
          compound: {},
          highlight: {
            path: body.text.path,
          },
        },
      },
      {
        $addFields: {
          highlights: {
            $meta: "searchHighlights",
          },
          score: {
            $meta: "searchScore",
          },
        },
      },
      {
        $skip: body.page ? body.page * (body.limit || 25) : 0,
      },
      {
        $limit: body.limit || 25,
      },
    ];

    const textSearch = {
      [body.text.operator ? "must" : "mustNot"]: [
        {
          compound: {
            should: [
              {
                text: {
                  query: body.text.query,
                  path: body.text.path,
                  matchCriteria: "all",
                  fuzzy: {
                    maxEdits: 1,
                  },
                },
              },
              {
                phrase: {
                  query: body.text.query,
                  path: body.text.path,
                  slop: 5,
                  score: {
                    boost: {
                      value: 2,
                    },
                  },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      ],
    };

    pipeline[0].$search.compound = textSearch;

    if (body.detailSearch) {
      pipeline[0].$search.compound["should"] = [
        {
          compound: detailSearch(body.search, body.field, body.operator),
        },
      ];
      pipeline[0].$search.compound["minimumShouldMatch"] = 1;
    }

    const data = await Data.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// @desc advance text search pagination for Full Text Search
// @route POST /advance-search/api/v1/data/page/default
// @access public

export const advanceTextSearchPageDefault = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body: SearchDetailType = req.body;
    const pipeline: any = [
      {
        $match: {
          $and: [
            {
              $text: {
                $search: body.text.query,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          score: { $meta: "textScore" },
        },
      },
      {
        $skip: body.page ? body.page * (body.limit || 25) : 0,
      },
      {
        $limit: body.limit || 25,
      },
    ];

    if (!body.text.operator) {
      pipeline.splice(1, 2);

      const matched = await Data.aggregate([
        pipeline[0],
        { $project: { _id: 1 } },
      ]);
      const idsToExclude = matched.map((doc) => doc._id);
      pipeline[0].$match.$and = [{ _id: { $nin: idsToExclude } }];
    }

    if (body.detailSearch) {
      pipeline[0].$match.$and.push(
        handleDefaultDetail(body.search, body.field, body.operator)
      );
    }

    const data = await Data.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// @desc indexing search query
// @route POST /advance-search/api/v1/data/query
// @access public
export const createQuery = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = { ...req.body.body };
    delete query.title;

    const indexedQuery = await Query.create({
      title: req.body.body.title,
      query: query,
    });

    res.status(200).json({ success: true, data: indexedQuery });
  }
);

// @desc get query titles
// @route GET /advance-search/api/v1/data/index-titles
// @access public
export const getQueryTitles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await Query.aggregate([{ $project: { title: 1, _id: 0 } }]);
    const titles = data.map((item) => item.title);

    res.status(200).json({ success: true, data: titles });
  }
);

// @desc get queries info
// @route GET /advance-search/api/v1/data/get-queries
// @access public
export const getQueriesInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await Query.aggregate([
      {
        $project: {
          title: 1,
          status: 1,
          numberOfResults: 1,
          createdAt: 1,
          _id: 1,
          query: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json({ success: true, data });
  }
);

// @desc get indexed search query data
// @route POST /advance-search/api/v1/data/get-queried-data
// @access public
export const getQueriedData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const id = new mongoose.Types.ObjectId(body._id as string);

    console.log(body);
    const data = await Data.aggregate([{ $match: { savedQueryIds: id } }]);

    res.status(200).json({ success: true, data });
  }
);
