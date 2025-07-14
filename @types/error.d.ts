export {};

declare global {
  interface Error {
    errmsg: string;
    errors: string;
    value: string;
    code: number;
    statusCode: number;
  }
}
