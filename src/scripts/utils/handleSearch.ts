import { SearchType } from "../types/types";

export const handleSearch = (search: SearchType) => {
  const DROPDOWN_ARRAY: string[] = ["hobbies", "role", "languages"];
  const TEXT_INPUT_ARRAY: string[] = ["name", "email", "company", "sex"];
  const DATE_INPUT_ARRAY: string[] = ["birthdate", "createdAt"];

  if (TEXT_INPUT_ARRAY.includes(search.path)) {
    return search.operator
      ? {
          text: {
            query: search.query,
            path: search.path === "name" ? "fullName" : search.path,
          },
        }
      : {
          compound: {
            mustNot: [
              {
                text: {
                  query: search.query,
                  path: search.path,
                  matchCriteria: "any",
                  fuzzy: {
                    maxEdits: 2,
                  },
                },
              },
            ],
          },
        };
  }

  if (DROPDOWN_ARRAY.includes(search.path)) {
    return search.operator
      ? {
          in: {
            value: search.query,
            path: search.path,
          },
        }
      : {
          compound: {
            mustNot: [
              {
                in: {
                  value: search.query,
                  path: search.path,
                },
              },
            ],
          },
        };
  }

  if (
    DATE_INPUT_ARRAY.includes(search.path) &&
    typeof search.query !== "string"
  ) {
    return search.operator
      ? {
          range: {
            path: search.path,
            gte:
              search.query.from === null
                ? new Date("1900-01-01")
                : new Date(search.query.from),
            lte:
              search.query.to === null ? new Date() : new Date(search.query.to),
          },
        }
      : {
          compound: {
            mustNot: [
              {
                range: {
                  path: search.path,
                  gte:
                    search.query.from === null
                      ? new Date("1900-01-01")
                      : new Date(search.query.from),
                  lte:
                    search.query.to === null
                      ? new Date()
                      : new Date(search.query.to),
                },
              },
            ],
          },
        };
  }
};
