# Bug Explanation

# 1. What was the bug?

The bug was in the `HttpClient.request()` method in [`src/httpClient.ts`](src/httpClient.ts:11). When the `oauth2Token` property was set to a plain JavaScript object (like `{ accessToken: "stale", expiresAt: 0 }`) instead of an `OAuth2Token` instance, the token was neither refreshed nor used to set the Authorization header.

# 2. Why did it happen?

The original code only checked for two token refresh conditions:

- `!this.oauth2Token` - checks for null/undefined (but plain objects are truthy)
- `(this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired)` - only checks OAuth2Token instances

A plain object passes neither condition: it's truthy (so the first check fails) and it's not an instance of OAuth2Token (so the second check is skipped). Additionally, the Authorization header was only set when `this.oauth2Token instanceof OAuth2Token`, so even if we wanted to use a plain object token, it wouldn't be converted to a Bearer header.

# 3. Why does your fix actually solve it?

The fix adds two changes:

1. An additional condition in the refresh check: `(typeof this.oauth2Token === 'object' && !(this.oauth2Token instanceof OAuth2Token))` - this detects any plain object token and treats it as needing refresh
2. An additional branch to set the Authorization header for plain objects with an `accessToken` property

This ensures that both token refresh and header setting work for both OAuth2Token instances and plain object tokens.

# 4. Tests

The tests in [`tests/httpClient.test.ts`](tests/httpClient.test.ts) verify different authentication scenarios:

- **Valid token**: Ensures a valid OAuth2Token is reused without refresh
- **Missing token**: Ensures a new token is refreshed when none exists
- **Plain object token (bug case)**: Ensures plain objects trigger token refresh
- **Expired token**: Ensures expired OAuth2Token instances are refreshed
