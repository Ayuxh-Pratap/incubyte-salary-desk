import pg from "pg";
const original = pg.Client.prototype.query;
pg.Client.prototype.query = function (...args) {
  const start = Date.now();
  const text = typeof args[0] === "string" ? args[0] : args[0]?.text || "";
  const kind = /salary_desk_environment/.test(text)
    ? "environment"
    : /^(begin|commit|rollback|set transaction)/i.test(text)
      ? text.split(" ")[0].toLowerCase()
      : /with ranked/.test(text)
        ? "salary-summary"
        : /grouping sets/.test(text)
          ? "headcounts"
          : /count\(/.test(text)
            ? "count"
            : /from "employees"/.test(text)
              ? "employees"
              : "lookup";
  const record = (result) =>
    console.log(
      "[perf-db]" +
        JSON.stringify({
          at: start,
          ms: Date.now() - start,
          kind,
          rows: result?.rowCount,
        }),
    );
  const callback = args.at(-1);
  if (typeof callback === "function") {
    args[args.length - 1] = function (error, result) {
      record(result);
      return callback(error, result);
    };
    return original.apply(this, args);
  }
  const result = original.apply(this, args);
  if (result?.then)
    return result.then(
      (value) => {
        record(value);
        return value;
      },
      (error) => {
        record();
        throw error;
      },
    );
  return result;
};
