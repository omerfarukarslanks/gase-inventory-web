"use client";

import { useEffect, useState } from "react";
import { getAttributes, type Attribute as AttributeDefinition } from "@/lib/attributes";
import { getAllProductCategories } from "@/lib/product-categories";

type UseProductMetadataOptions = {
  canReadPage: boolean;
};

export function useProductMetadata({ canReadPage }: UseProductMetadataOptions) {
  const [attributeDefinitions, setAttributeDefinitions] = useState<AttributeDefinition[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (!canReadPage) return;
    getAttributes()
      .then((res) => setAttributeDefinitions(res))
      .catch(() => setAttributeDefinitions([]));
  }, [canReadPage]);

  useEffect(() => {
    if (!canReadPage) return;
    getAllProductCategories({ isActive: "all" })
      .then((categories) => {
        const options = (categories ?? [])
          .map((category) => ({
            value: category.id,
            label: category.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "tr"));
        setCategoryOptions(options);
      })
      .catch(() => setCategoryOptions([]));
  }, [canReadPage]);

  return {
    attributeDefinitions,
    categoryOptions,
  };
}
