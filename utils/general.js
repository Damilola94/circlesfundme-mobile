import moment from "moment-timezone";

export const logger = (...logs) =>
  process.env.NODE_ENV === "development"
    ? // eslint-disable-next-line no-console
      console.log(...logs, `(Log time - ${moment().format("LLL")})`)
    : undefined;
