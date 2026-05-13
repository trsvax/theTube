var SLUGS = {
  "su": "/posts/short-urls-in-frontmatter"
};

function handler(event) {
  var uri = event.request.uri.slice(1);
  var target = SLUGS[uri];
  if (target) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: target } },
    };
  }
  return event.request;
}
