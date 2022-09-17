import invariant from "tiny-invariant";

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}

export default function getEnv() {
  invariant(process.env.ADMIN_EMAIL, "ADMIN_EMAIL is required");

  return {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  };
}
