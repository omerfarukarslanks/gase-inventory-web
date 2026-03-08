"use client";

import type { Permission, RoleEntry } from "@/lib/permissions";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useLang } from "@/context/LangContext";

type RolePermissionsDrawerProps = {
  open: boolean;
  editingRole: RoleEntry | null;
  roleSubmitting: boolean;
  roleLoading: boolean;
  roleFormError: string;
  groupedPerms: Map<string, Permission[]>;
  selectedPermNames: Set<string>;
  isMobile: boolean;
  onClose: () => void;
  onToggleRolePerm: (name: string, checked: boolean) => void;
  onSaveRolePerms: () => void;
};

export default function RolePermissionsDrawer({
  open,
  editingRole,
  roleSubmitting,
  roleLoading,
  roleFormError,
  groupedPerms,
  selectedPermNames,
  isMobile,
  onClose,
  onToggleRolePerm,
  onSaveRolePerms,
}: RolePermissionsDrawerProps) {
  const { t } = useLang();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={editingRole ? `${editingRole.role} - ${t("permissions.editRoleTitle")}` : t("permissions.editRoleTitle")}
      description={t("permissions.editRoleDesc")}
      closeDisabled={roleSubmitting || roleLoading}
      className={cn(isMobile && "!max-w-none")}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label={t("common.cancel")}
            type="button"
            onClick={onClose}
            disabled={roleSubmitting || roleLoading}
            variant="secondary"
          />
          <Button
            label={roleSubmitting ? t("common.saving") : t("common.save")}
            type="button"
            onClick={onSaveRolePerms}
            disabled={roleSubmitting || roleLoading}
            variant="primarySolid"
          />
        </div>
      }
    >
      <div className="space-y-5 p-5">
        {roleLoading ? (
          <p className="text-sm text-muted">{t("common.loading")}</p>
        ) : groupedPerms.size === 0 && !roleFormError ? (
          <p className="text-sm text-muted">{t("permissions.noPermissions")}</p>
        ) : (
          [...groupedPerms.entries()].map(([group, permissions]) => (
            <div key={group} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
              <div className="space-y-1">
                {permissions.map((permission) => (
                  <label
                    key={permission.name}
                    className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface2/60"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                      checked={selectedPermNames.has(permission.name)}
                      onChange={(event) => onToggleRolePerm(permission.name, event.target.checked)}
                      disabled={roleSubmitting}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-text">{permission.name}</p>
                      <p className="text-xs text-muted">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}

        {roleFormError && <p className="text-sm text-error">{roleFormError}</p>}
      </div>
    </Drawer>
  );
}
