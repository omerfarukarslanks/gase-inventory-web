"use client";

import type { ReactNode } from "react";
import IconButton from "@/components/ui/IconButton";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { EditIcon } from "@/components/ui/icons/TableIcons";
import type { Permission } from "@/lib/permissions";
import { useLang } from "@/context/LangContext";

type PermissionsTableProps = {
  permissions: Permission[];
  permLoading: boolean;
  permError: string;
  canManage: boolean;
  togglingPermIds: string[];
  onEditPermission: (permission: Permission) => void;
  onTogglePermActive: (permission: Permission, next: boolean) => void;
  footer?: ReactNode;
};

export default function PermissionsTable({
  permissions,
  permLoading,
  permError,
  canManage,
  togglingPermIds,
  onEditPermission,
  onTogglePermActive,
  footer,
}: PermissionsTableProps) {
  const { t } = useLang();

  return (
    <section className="overflow-hidden rounded-xl2 border border-border bg-surface">
      {permLoading ? (
        <div className="p-6 text-sm text-muted">{t("permissions.permissionsLoading")}</div>
      ) : permError ? (
        <div className="p-6">
          <p className="text-sm text-error">{permError}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border bg-surface2/70">
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">{t("permissions.colName")}</th>
                  <th className="px-4 py-3">{t("permissions.colGroup")}</th>
                  <th className="px-4 py-3">{t("permissions.colDescription")}</th>
                  <th className="px-4 py-3">{t("permissions.colStatus")}</th>
                  <th className="sticky right-0 z-20 bg-surface2/70 px-4 py-3 text-right">{t("permissions.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                      {t("common.noData")}
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission) => (
                    <tr
                      key={permission.id}
                      className="group border-b border-border last:border-b-0 transition-colors hover:bg-surface2/50"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium text-text">{permission.name}</td>
                      <td className="px-4 py-3 text-sm text-text2">
                        <span className="inline-flex items-center rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-medium text-text2">
                          {permission.group}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text2">{permission.description}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            permission.isActive ? "bg-primary/15 text-primary" : "bg-error/15 text-error"
                          }`}
                        >
                          {permission.isActive ? t("common.active") : t("common.passive")}
                        </span>
                      </td>
                      <td className="sticky right-0 z-10 bg-surface px-4 py-3 text-right group-hover:bg-surface2/50">
                        <div className="inline-flex items-center gap-1">
                          {canManage && (
                            <IconButton
                              onClick={() => onEditPermission(permission)}
                              disabled={togglingPermIds.includes(permission.id)}
                              aria-label={t("permissions.editPermissionAction")}
                              title={t("common.edit")}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {canManage && (
                            <ToggleSwitch
                              checked={permission.isActive}
                              onChange={(next) => onTogglePermActive(permission, next)}
                              disabled={togglingPermIds.includes(permission.id)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {footer}
        </>
      )}
    </section>
  );
}
