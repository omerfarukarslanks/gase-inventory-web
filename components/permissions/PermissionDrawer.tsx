"use client";

import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { cn } from "@/lib/cn";
import type { PermForm } from "@/components/permissions/types";

type PermissionDrawerProps = {
  open: boolean;
  editingPermId: string | null;
  permSubmitting: boolean;
  isMobile: boolean;
  permForm: PermForm;
  permFormError: string;
  permNameError: string;
  permDescError: string;
  permGroupError: string;
  onClose: () => void;
  onFormChange: (field: keyof PermForm, value: string | boolean) => void;
  onSubmit: () => void;
};

export default function PermissionDrawer({
  open,
  editingPermId,
  permSubmitting,
  isMobile,
  permForm,
  permFormError,
  permNameError,
  permDescError,
  permGroupError,
  onClose,
  onFormChange,
  onSubmit,
}: PermissionDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingPermId ? "Yetki Düzenle" : "Yeni Yetki"}
      description={
        editingPermId
          ? "Yetki açıklamasını ve grubunu güncelleyin."
          : "Sisteme yeni bir yetki tanımı ekleyin."
      }
      closeDisabled={permSubmitting}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label="İptal"
            type="button"
            onClick={onClose}
            disabled={permSubmitting}
            variant="secondary"
          />
          <Button
            label={permSubmitting ? "Kaydediliyor..." : "Kaydet"}
            type="button"
            onClick={onSubmit}
            disabled={permSubmitting}
            variant="primarySolid"
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <InputField
          label="Ad *"
          type="text"
          value={permForm.name}
          onChange={(value) => onFormChange("name", value)}
          placeholder="SALE_CREATE"
          error={permNameError}
          disabled={Boolean(editingPermId)}
        />

        <InputField
          label="Açıklama *"
          type="text"
          value={permForm.description}
          onChange={(value) => onFormChange("description", value)}
          placeholder="Yeni satış fişi oluşturma"
          error={permDescError}
        />

        <InputField
          label="Grup *"
          type="text"
          value={permForm.group}
          onChange={(value) => onFormChange("group", value)}
          placeholder="Satış"
          error={permGroupError}
        />

        {permFormError && <p className="text-sm text-error">{permFormError}</p>}
      </div>
    </Drawer>
  );
}
