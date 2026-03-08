export type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  surname?: string;
  tenantId?: string;
  role?: string;
  storeType?: string;
  storeId?: string;
  permissions?: string[];
  store?: {
    id?: string;
    storeType?: string;
  };
  stores?: Array<{
    id?: string;
    storeId?: string;
  }>;
  storeIds?: string[];
  userStores?: Array<{
    storeId?: string;
    storeType?: string;
    store?: {
      id?: string;
      storeType?: string;
    };
  }>;
};

export type SessionStoreType = "RETAIL" | "WHOLESALE";

function asStoreType(storeType?: string | null): SessionStoreType | null {
  if (!storeType) return null;
  const normalized = storeType.toUpperCase();
  if (normalized === "WHOLESALE") return "WHOLESALE";
  if (normalized === "RETAIL") return "RETAIL";
  return null;
}

export function getSessionUserStoreType(user?: SessionUser | null): SessionStoreType | null {
  if (!user) return null;

  const direct = asStoreType(user.storeType);
  if (direct) return direct;

  const fromStore = asStoreType(user.store?.storeType);
  if (fromStore) return fromStore;

  if (Array.isArray(user.userStores)) {
    for (const item of user.userStores) {
      const fromUserStore = asStoreType(item?.storeType ?? item?.store?.storeType);
      if (fromUserStore) return fromUserStore;
    }
  }

  return null;
}

export function getSessionUserStoreIds(user: SessionUser | null): string[] {
  if (!user) return [];

  const ids = new Set<string>();
  if (typeof user.storeId === "string" && user.storeId.trim()) {
    ids.add(user.storeId);
  }
  const singleStoreId = user.store?.id;
  if (typeof singleStoreId === "string" && singleStoreId.trim()) {
    ids.add(singleStoreId);
  }

  if (Array.isArray(user.stores)) {
    for (const item of user.stores) {
      const storeId = item?.storeId ?? item?.id;
      if (typeof storeId === "string" && storeId.trim()) ids.add(storeId);
    }
  }

  if (Array.isArray(user.storeIds)) {
    for (const storeId of user.storeIds) {
      if (typeof storeId === "string" && storeId.trim()) ids.add(storeId);
    }
  }

  if (Array.isArray(user.userStores)) {
    for (const item of user.userStores) {
      const storeId = item?.storeId ?? item?.store?.id;
      if (typeof storeId === "string" && storeId.trim()) ids.add(storeId);
    }
  }

  return [...ids];
}
