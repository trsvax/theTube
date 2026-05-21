var SLUGS = {
  "su": "/posts/short-urls-in-frontmatter"
};

var REDIRECTS = {
  "/blog": "/journal",
};

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Write endpoint — return 202, CloudFront logs the request
  if (uri.startsWith("/w/") && request.querystring) {
    return {
      statusCode: 202,
      statusDescription: "Accepted",
      headers: {
        "access-control-allow-origin": { value: "https://thetube.today" },
        "cache-control": { value: "no-store" },
      },
    };
  }

  // Path redirect (e.g. /blog → /journal)
  var redirect = REDIRECTS[uri];
  if (redirect) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: redirect } },
    };
  }

  // Short URL redirect
  var slug = uri.slice(1);
  var target = SLUGS[slug];
  if (target) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: target } },
    };
  }

  // Rewrite extensionless URLs to .html
  if (!uri.includes(".")) {
    var clean = uri.replace(/\/$/, "");
    request.uri = (clean || "/index") + ".html";
  }

  return request;
}
