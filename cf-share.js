// CloudFront Function — /tube/share/* behavior (viewer-request)
//
// Routing:
//   /tube/share/add?...  → 202 (field capture, data in URL, logged by CloudFront)
//   /tube/share/upload   → pass through to Lambda (body needs processing)
//   /tube/share/*?*      → 202 (default: query string = log only)
//   /tube/share/*        → pass through to Lambda (no query string = compute)

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var qs = request.querystring;

  // Authorization header is part of the contract — the path doesn't exist without it.
  if (!request.headers.authorization) {
    return {
      statusCode: 404,
      statusDescription: "Not Found",
      headers: { "cache-control": { value: "no-store" } },
    };
  }

  // Query string present → log and 202 (CloudFront logs the full URL)
  var hasQs = false;
  for (var k in qs) {
    hasQs = true;
    break;
  }
  if (hasQs) {
    return {
      statusCode: 202,
      statusDescription: "Accepted",
      headers: {
        "access-control-allow-origin": { value: "https://thetube.today" },
        "cache-control": { value: "no-store" },
      },
    };
  }

  // No query string → needs compute, pass through to origin (Lambda)
  return request;
}
