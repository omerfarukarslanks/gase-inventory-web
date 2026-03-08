"use client";

import { useProductCategoriesListState } from "@/components/product-categories/useProductCategoriesListState";
import { useProductCategoryFormState } from "@/components/product-categories/useProductCategoryFormState";
import type { ProductCategoriesPageMessages } from "@/components/product-categories/types";

type UseProductCategoriesPageStateOptions = {
  canReadPage: boolean;
  loadErrorMessage: ProductCategoriesPageMessages["loadErrorMessage"];
};

export function useProductCategoriesPageState({
  canReadPage,
  loadErrorMessage,
}: UseProductCategoriesPageStateOptions) {
  const messages = {
    loadErrorMessage,
  };
  const listState = useProductCategoriesListState({
    canReadPage,
    messages,
  });
  const formState = useProductCategoryFormState({
    allCategories: listState.allCategories,
    messages,
    onRefresh: listState.refreshAll,
  });

  return {
    ...listState,
    ...formState,
  };
}
