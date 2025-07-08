export const handleDefaultSearch = (search: SearchType) => {
  const DROPDOWN_ARRAY: string[] = ["hobbies", "languages"];
  const TEXT_INPUT_ARRAY: string[] = [
    "role",
    "name",
    "email",
    "company",
    "sex",
  ];
  const DATE_INPUT_ARRAY: string[] = ["birthdate", "createdAt"];

  if (DROPDOWN_ARRAY.includes(search.path)) {
    if (search.operator) {
      return {
        [search.path]: { $in: [search.query] },
      };
    }
    return {
      [search.path]: { $not: { $in: [search.query] } },
    };
  }
  if (TEXT_INPUT_ARRAY.includes(search.path)) {
    if (search.operator) {
      return {
        [search.path]: search.query,
      };
    }
    return {
      [search.path]: { $not: { $eq: search.query } },
    };
  }
  if (
    DATE_INPUT_ARRAY.includes(search.path) &&
    typeof search.query !== "string"
  ) {
    if (search.operator) {
      return {
        [search.path]: {
          $gte:
            search.query.from === null
              ? new Date("1900-01-01")
              : new Date(search.query.from),
          $lte:
            search.query.to === null ? new Date() : new Date(search.query.to),
        },
      };
    }
  }
};
