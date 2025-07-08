import { handleDefaultSearch } from "./handleDefaultSearch";

export const handleDefaultDetail = (
  searchObj: SearchObject,
  fieldObj: FieldObject,
  operator: boolean
) => {
  const op = operator ? "$and" : "$or";
  const field: any = {};
  field[op] = [];
  for (const key in searchObj) {
    field[op].push(handleDefaultSearch(searchObj[key]));
  }
  for (const key in fieldObj) {
    field[op].push(
      handleDefaultDetail(
        fieldObj[key].search,
        fieldObj[key].field,
        fieldObj[key].operator
      )
    );
  }

  return field;
};
