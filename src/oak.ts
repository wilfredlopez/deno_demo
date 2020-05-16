import {
  Application,
  Router,
  send,
  Context,
  Status,
} from "https://deno.land/x/oak/mod.ts";

import { bold, green } from "https://deno.land/std/fmt/colors.ts";
import { red, blue } from "https://deno.land/std@0.51.0/fmt/colors.ts";
const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "The Hound of the Baskervilles",
  author: "Conan Doyle, Author",
});

const router = new Router();

router
  .get("/api", (context) => {
    context.response.body = "Hello API!";
  })
  .get("/api/book", (context) => {
    context.response.body = Array.from(books.values());
  })
  .get("/api/book/:id", (context) => {
    if (context.params && context.params.id && books.has(context.params.id)) {
      context.response.body = books.get(context.params.id);
    } else {
      return notFound(context);
    }
  });

const app = new Application();

app.addEventListener("error", (evt) => {
  // Will log the thrown error to the console.
  // console.log(evt.error);
  LogFailure("@Error Listener", evt.error);
});

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  // console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
  LogRoute(ctx.request.method, `${ctx.request.url} - ${rt}`);
});
// Response Time
app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  context.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.use(router.routes());
app.use(router.allowedMethods());

//static content
// --allow-read is needeed for this to work
// router.get("/", async (context) => {
//   try {
//     await send(context, context.request.url.pathname, {
//       root: `${Deno.cwd()}/public/`,
//       index: `index.html`,
//     });
//   } catch (error) {
//     LogFailure("@static content", error);
//     return notFound(context);
//   }
// });

//static folder
// --allow-read is needeed for this to work
app.use(async (context) => {
  try {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/public/`,
      index: `index.html`,
    });
  } catch (error) {
    LogFailure("@static content", error);
    return notFound(context);
  }
});

function notFound(context: Context) {
  context.response.status = Status.NotFound;
  context.response.body =
    `<html><body><h1>404 - Not Found</h1><p>Path <code>${context.request.url}</code> not found.`;
}
// A basic 404 page
app.use(notFound);

const PORT = Deno.env.get("PORT") || "5600";

function LogSuccess(from: string, message: string) {
  console.log(green(bold(from)), "[", bold(message), "]");
}
function LogFailure(from: string, message: string) {
  console.log(red(bold(from)), "", message, "");
}
function LogRoute(method: string, message: string) {
  console.log(blue(bold(method)), "", message, "");
}

LogSuccess("@Server", `Listening on http://localhost:${PORT}/`);
await app.listen({ port: +PORT });
