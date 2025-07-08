import { handleSearch } from "./handleSearch";

export const detailSearch = (
  searchObj: SearchObject,
  fieldObj: FieldObject,
  operator: boolean
) => {
  const compound: any = {};
  const op: string = operator ? "must" : "should";
  compound[op] = [];
  operator ? null : (compound["minimumShouldMatch"] = 1);
  for (const key in searchObj) {
    compound[op].push(handleSearch(searchObj[key]));
  }
  for (const key in fieldObj) {
    const field = {
      compound: detailSearch(
        fieldObj[key].search,
        fieldObj[key].field,
        fieldObj[key].operator
      ),
    };
    compound[op].push(field);
  }
  return compound;
};
