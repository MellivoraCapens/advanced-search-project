export {};

declare global {
  interface SearchDetailType {
    text: {
      query: string;
      operator: boolean;
      path: Array<string>;
    };
    detailSearch: boolean;
    operator: boolean;
    search: { [key: number]: SearchType };
    field: { [key: number]: FieldType };
    limit?: number;
    page?: number;
    title?: string;
  }

  interface FieldType {
    operator: boolean;
    search: SearchObject;
    field: FieldObject;
  }

  interface SearchType {
    query: string | DateRange;
    path: string;
    operator: boolean;
  }

  interface SearchObject {
    [key: number]: SearchType;
  }

  interface FieldObject {
    [key: number]: FieldType;
  }

  interface DateRange {
    from: Date | null;
    to: Date | null;
  }

  interface Error {
    errmsg: string;
    errors: string;
    value: string;
    code: number;
    statusCode: number;
  }
}
