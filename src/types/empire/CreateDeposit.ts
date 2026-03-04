export type CreateDepositItemPayload = {
  id: number;
  coin_value: number;
};

export type CreateDepositItemsPayload = CreateDepositItemPayload[];

export type CreateDepositItemControllerPayload = {
  id: number;
  price: number;
};

export type CreateDepositItemsControllerPayload =
  CreateDepositItemControllerPayload[];
