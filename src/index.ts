import {
  serve,
  ServerRequest,
  Response,
} from "https://deno.land/std@0.50.0/http/server.ts";

const server = serve({ port: 5900 });
console.log("Server Listening on http://localhost:5900/");

for await (const req of server) {
  handleRequest(req);
}

function handleRequest(req: ServerRequest) {
  switch (req.method) {
    case "GET":
      if (req.url === "/") {
        return req.respond({ body: "Index Route.\n" });
      }
      break;
    default:
      break;
  }
  //default 404
  req.respond({ body: "404. page not found\n" });
}
