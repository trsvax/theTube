// CloudFront Function — /tube/share/* behavior (viewer-request)
//
// Trust model:
//   No JWT       → 404 (endpoint doesn't exist without auth)
//   JWT + ?      → pass to Lambda (verify JWT, data already in CF log)
//   JWT + no ?   → pass to Lambda (verify JWT, save body)
//
// Use an anonymous JWT for public/unauthenticated captures.
// The ? decides where data lands. Lambda always verifies.

function handler(event) {
  var request = event.request;
  var qs = request.querystring;

  // No JWT → 404. Endpoint doesn't exist without auth.
  if (!request.headers.authorization) {
    return {
      statusCode: 404,
      statusDescription: "Not Found",
      headers: { "cache-control": { value: "no-store" } },
    };
  }

  // JWT present → pass through to Lambda (verify + decide)
  return request;
}
