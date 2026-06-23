import axios, { AxiosInstance } from "axios";

export class HttpsClient {
  private readonly httpsClient: AxiosInstance;

  constructor(apiKey: string, apiBaseUrl: string) {
    this.httpsClient = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 180000, // 3 minutes
    });
  }

  public async request<T>(
    url: string,
    method: string,
    body: string,
  ): Promise<{ data: T; statusCode: number }> {
    try {
      const { data, status } = await this.httpsClient.request<T>({
        url,
        method,
        data: body,
      });
      return { data, statusCode: status };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          data: error.response.data as T,
          statusCode: error.response.status,
        };
      }
      return {
        data: (error instanceof Error ? error.message : error) as unknown as T,
        statusCode: 500,
      };
    }
  }
}
