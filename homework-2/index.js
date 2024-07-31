import * as http from "node:http";

const PORT = process.env.PORT || 3000;

const routes = {
  "": async () => {},
  health: async () => {
    return { status: "OK" };
  },
};

http
  .createServer(async (req, res) => {
    const pathname = new URL(req.url, "http://127.0.0.1").pathname.replace(
      /^\/|\/$/g,
      ""
    );
    const routeResult = routes[pathname] && (await routes[pathname](req, res));
    const statusCode = routeResult ? 200 : 404;
    const data = routeResult || { status: "Not Found" };
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    console.log(`${req.method} ${req.url} ${statusCode}`);
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
