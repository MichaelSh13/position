export {};

declare global {
  type PositionIsActiveOption = {
    approving?: boolean;
    error?: boolean;
    activated?: boolean;
    parent?: boolean;
  };
}
