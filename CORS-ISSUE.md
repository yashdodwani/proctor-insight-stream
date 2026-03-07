# CORS Issue — S3 Frontend → Backend API

## Problem

The S3-hosted frontend (`http://proctoringreports.s3-website-us-east-1.amazonaws.com`) makes
cross-origin requests to `https://proctoring.formapply.in`. The backend must respond with the
appropriate CORS headers, otherwise browsers will block the response.

## Required Backend CORS Headers

The backend at `https://proctoring.formapply.in` must include:

```
Access-Control-Allow-Origin: http://proctoringreports.s3-website-us-east-1.amazonaws.com
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Or, for open access:

```
Access-Control-Allow-Origin: *
```

## Development Workaround (already implemented)

The Vite dev server proxies `/reports/*` requests to the backend so CORS is not needed
during local development. See `vite.config.ts`:

```ts
proxy: {
  '/reports': {
    target: 'https://proctoring.formapply.in',
    changeOrigin: true,
  },
}
```

## Production Fix

Either:
1. **Add CORS headers on the backend** (preferred) — allow the S3 origin above.
2. **Use a reverse proxy / CloudFront** in front of the S3 bucket so both the
   frontend and API requests pass through the same domain.

