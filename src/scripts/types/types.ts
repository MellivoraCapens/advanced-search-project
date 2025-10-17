export interface SearchDetailType {
  text: {
    query: string;
    operator: boolean;
    path: Array<string>;
  };
  detailSearch: boolean;
  operator: boolean;
  search: SearchObject;
  field: FieldObject;
  limit?: number;
  page?: number;
  title?: string;
}

export interface FieldType {
  operator: boolean;
  search: SearchObject;
  field: FieldObject;
}

export interface SearchType {
  query: string | DateRange;
  path: string;
  operator: boolean;
}

export interface SearchObject {
  [key: number]: SearchType;
}

export interface FieldObject {
  [key: number]: FieldType;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export type chalkColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright"
  | "bgCyan"
  | "bgWhite"
  | "bgMagenta"
  | "bold"
  | "italic"
  | "underline";

export interface chalkColoring {
  c?: "cyan";
  y?: "yellow";
  r?: "red";
  g?: "green";
  b?: "blue";
  m?: "magenta";
  bl?: "black";
}

export type chalkStyles = "italic" | "underline" | "bold";
