/// <reference types="vite/client" />

declare module "virtual:worker" {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
