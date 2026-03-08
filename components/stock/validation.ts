"use client";

type StoreScopedItem = {
  storeId: string;
};

type NumericValidationResult = {
  error: string | null;
  value: number | null;
};

export function validateInventoryItemsPresent(
  items: unknown[],
  message: string,
): string | null {
  return items.length === 0 ? message : null;
}

export function validateDistinctInventoryStoreIds(
  items: StoreScopedItem[],
  message: string,
): string | null {
  const usedStoreIds = new Set<string>();

  for (const item of items) {
    if (usedStoreIds.has(item.storeId)) {
      return message;
    }
    usedStoreIds.add(item.storeId);
  }

  return null;
}

export function validatePositiveNumericInput(
  value: string,
  message: string,
): NumericValidationResult {
  if (!value) {
    return { error: message, value: null };
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { error: message, value: null };
  }

  return { error: null, value: numeric };
}

export function validateNonNegativeNumericInput(
  value: string,
  message: string,
): NumericValidationResult {
  if (value === "") {
    return { error: message, value: null };
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return { error: message, value: null };
  }

  return { error: null, value: numeric };
}

type TransferValidationMessages = {
  sourceStoreRequired: string;
  targetStoreRequired: string;
  sameStoreError: string;
  quantityPositive: string;
  exceedsStock: string;
};

export function validateInventoryTransferForm(
  input: {
    fromStoreId: string;
    toStoreId: string;
    quantity: string;
    availableQuantity: number;
  },
  messages: TransferValidationMessages,
): { error: string | null; quantity: number | null } {
  if (!input.fromStoreId) {
    return { error: messages.sourceStoreRequired, quantity: null };
  }

  if (!input.toStoreId) {
    return { error: messages.targetStoreRequired, quantity: null };
  }

  if (input.fromStoreId === input.toStoreId) {
    return { error: messages.sameStoreError, quantity: null };
  }

  const quantity = Number(input.quantity);
  if (!input.quantity || quantity <= 0) {
    return { error: messages.quantityPositive, quantity: null };
  }

  if (quantity > input.availableQuantity) {
    return { error: messages.exceedsStock, quantity: null };
  }

  return { error: null, quantity };
}
