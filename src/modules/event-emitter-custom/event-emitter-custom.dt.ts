export {};

declare global {
  type BaseEvent = {
    id: string;
    payload: object;
  };
}
