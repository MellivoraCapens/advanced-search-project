import { detailSearch } from "./detailSearch";
import { SearchDetailType } from "../types/types";
import mongoose from "mongoose";

const pipelineMaker = (
  query: SearchDetailType,
  lastUpdatedId: string | null
) => {
  const pipeline: any = [
    {
      $search: {
        index: "advance",
        compound: {},
      },
    },
    {
      $project: { _id: 1 },
    },
  ];

  if (lastUpdatedId) {
    pipeline.splice(1, 0, {
      $match: { _id: { $gt: new mongoose.Types.ObjectId(lastUpdatedId) } },
    });
  }

  const textSearch = {
    [query.text.operator ? "must" : "mustNot"]: [
      {
        compound: {
          should: [
            {
              text: {
                query: query.text.query,
                path: query.text.path,
                matchCriteria: "all",
                fuzzy: {
                  maxEdits: 1,
                },
              },
            },
            {
              phrase: {
                query: query.text.query,
                path: query.text.path,
                slop: 5,
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    ],
  };

  pipeline[0].$search.compound = textSearch;

  if (query.detailSearch) {
    pipeline[0].$search.compound["should"] = [
      {
        compound: detailSearch(query.search, query.field, query.operator),
      },
    ];
    pipeline[0].$search.compound["minimumShouldMatch"] = 1;
  }

  return pipeline;
};

export default pipelineMaker;
