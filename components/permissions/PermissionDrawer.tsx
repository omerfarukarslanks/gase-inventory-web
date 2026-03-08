"use client";

import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { cn } from "@/lib/cn";
import type { PermForm } from "@/components/permissions/types";
import { useLang } from "@/context/LangContext";

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
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingPermId ? t("permissions.editTitle") : t("permissions.createTitle")}
      description={
        editingPermId
          ? t("permissions.editDesc")
          : t("permissions.createDesc")
      }
      closeDisabled={permSubmitting}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={permSubmitting}
            variant="secondary"
          />
          <Button
            label={permSubmitting ? t("common.saving") : t("common.save")}
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
          label={t("permissions.name")}
          type="text"
          value={permForm.name}
          onChange={(value) => onFormChange("name", value)}
          placeholder={t("permissions.permissionNamePlaceholder")}
          error={permNameError}
          disabled={Boolean(editingPermId)}
        />

        <InputField
          label={t("permissions.description")}
          type="text"
          value={permForm.description}
          onChange={(value) => onFormChange("description", value)}
          placeholder={t("permissions.permissionDescriptionPlaceholder")}
          error={permDescError}
        />

        <InputField
          label={t("permissions.group")}
          type="text"
          value={permForm.group}
          onChange={(value) => onFormChange("group", value)}
          placeholder={t("permissions.permissionGroupPlaceholder")}
          error={permGroupError}
        />

        {permFormError && <p className="text-sm text-error">{permFormError}</p>}
      </div>
    </Drawer>
  );
}
