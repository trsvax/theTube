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
  if (uri.startsWith("/tube/") && request.querystring) {
    return {
      statusCode: 202,
      statusDescription: "Noted",
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

  // Alias redirect — /a/{alias} → target
  if (uri.startsWith("/a/")) {
    var alias = uri.slice(3);
    var target = SLUGS[alias];
    if (target) {
      return {
        statusCode: 301,
        statusDescription: "Moved Permanently",
        headers: { location: { value: target } },
      };
    }
  }

  // Rewrite extensionless URLs to .html
  if (!uri.includes(".")) {
    var clean = uri.replace(/\/$/, "");
    request.uri = (clean || "/index") + ".html";
  }

  return request;
}
