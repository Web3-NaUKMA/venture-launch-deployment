import { AxiosResponse } from 'axios';

export interface IRequestHandler {
  readonly get: <T>(url: string) => Promise<AxiosResponse<T>>;
  readonly post: <T, Body>(url: string, body: Body) => Promise<AxiosResponse<T>>;
  readonly put: <T, Body>(url: string, body: Body) => Promise<AxiosResponse<T>>;
  readonly delete: <T>(url: string) => Promise<AxiosResponse<T>>;
}
