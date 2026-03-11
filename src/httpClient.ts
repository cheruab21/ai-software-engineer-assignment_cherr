import { OAuth2Token } from "./tokens";
export type TokenState = OAuth2Token | Record<string, unknown> | null;

export class HttpClient {
  oauth2Token: TokenState = null;

  refreshOAuth2(): void {
    this.oauth2Token = new OAuth2Token("fresh-token", 10 ** 10);
  }

  request(
    method: string,
    path: string,
    opts?: { api?: boolean; headers?: Record<string, string> },
  ): { method: string; path: string; headers: Record<string, string> } {
    const api = opts?.api ?? false;
    const headers = opts?.headers ?? {};

    if (api) {
      // Check if token needs refresh: null/undefined, OR OAuth2Token that's expired, OR plain object
      if (
        !this.oauth2Token ||
        (this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired) ||
        (typeof this.oauth2Token === "object" &&
          !(this.oauth2Token instanceof OAuth2Token))
      ) {
        this.refreshOAuth2();
      }

      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      } else if (this.oauth2Token && "accessToken" in this.oauth2Token) {
        headers["Authorization"] =
          `Bearer ${(this.oauth2Token as { accessToken: string }).accessToken}`;
      }
    }

    return { method, path, headers };
  }
}
