var SLUGS = {
  su: "/posts/short-urls-in-frontmatter",
};

function handler(event) {
  var request = event.request;
  var uri = request.uri;

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
