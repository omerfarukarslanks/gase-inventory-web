"use client";

import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import InputField from "@/components/ui/InputField";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { useLang } from "@/context/LangContext";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/users";
import type { UserForm, UserFormErrors } from "@/components/users/types";

type UserDrawerProps = {
  open: boolean;
  mode: "edit" | "create";
  selectedUser: User | null;
  saving: boolean;
  isMobile: boolean;
  form: UserForm;
  errors: UserFormErrors;
  roleOptions: Array<{ value: string; label: string }>;
  storeOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSave: () => void;
  onFormChange: <K extends keyof UserForm>(field: K, value: UserForm[K]) => void;
};

export default function UserDrawer({
  open,
  mode,
  selectedUser,
  saving,
  isMobile,
  form,
  errors,
  roleOptions,
  storeOptions,
  onClose,
  onSave,
  onFormChange,
}: UserDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={mode === "create" ? t("users.new") : t("users.update")}
      description={mode === "create" ? t("users.createDesc") : t("users.editDesc")}
      closeDisabled={saving}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={saving}
            variant="secondary"
          />
          <Button
            label={saving ? t("common.saving") : t("common.save")}
            type="button"
            onClick={onSave}
            disabled={saving}
            variant="primarySolid"
          />
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <InputField
          label={t("users.name")}
          type="text"
          value={form.name}
          onChange={(value) => onFormChange("name", value)}
          error={mode === "create" ? errors.name : undefined}
        />

        <InputField
          label={t("users.surname")}
          type="text"
          value={form.surname}
          onChange={(value) => onFormChange("surname", value)}
          error={mode === "create" ? errors.surname : undefined}
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted">{t("users.role")}</label>
          <SearchableDropdown
            options={roleOptions}
            value={form.role}
            onChange={(role) => onFormChange("role", role)}
            placeholder={t("users.rolePlaceholder")}
            inputAriaLabel={t("users.role")}
            toggleAriaLabel={t("users.role")}
            allowClear={false}
            showEmptyOption={false}
          />
        </div>

        {mode === "create" ? (
          <>
            <InputField
              label={t("users.email")}
              type="email"
              value={form.email}
              onChange={(value) => onFormChange("email", value)}
              error={errors.email}
            />
            <InputField
              label={t("users.password")}
              type="password"
              value={form.password}
              onChange={(value) => onFormChange("password", value)}
              error={errors.password}
            />
          </>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">{t("users.emailReadonly")}</label>
            <div className="w-full rounded-xl2 border border-border bg-surface2 px-4 py-2.5 text-sm text-text2">
              {selectedUser?.email}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted">{t("users.store")}</label>
          <SearchableDropdown
            options={storeOptions}
            value={form.storeId}
            onChange={(storeId) => onFormChange("storeId", storeId)}
            placeholder={t("users.storePlaceholder")}
            emptyOptionLabel={t("users.storePlaceholder")}
            inputAriaLabel={t("users.store")}
            clearAriaLabel={t("common.clearFilters")}
            toggleAriaLabel={t("users.store")}
          />
          {storeOptions.length === 0 && (
            <div className="px-1 text-xs text-muted">{t("users.storeNotFound")}</div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
