"use client";

import IconButton from "@/components/ui/IconButton";
import { EditIcon } from "@/components/ui/icons/TableIcons";
import type { RoleEntry } from "@/lib/permissions";
import { useLang } from "@/context/LangContext";

type RolesTableProps = {
  roles: RoleEntry[];
  rolesLoading: boolean;
  rolesError: string;
  canManage: boolean;
  onEditRole: (role: RoleEntry) => void | Promise<void>;
};

export default function RolesTable({
  roles,
  rolesLoading,
  rolesError,
  canManage,
  onEditRole,
}: RolesTableProps) {
  const { t } = useLang();

  return (
    <section className="overflow-hidden rounded-xl2 border border-border bg-surface">
      {rolesLoading ? (
        <div className="p-6 text-sm text-muted">{t("permissions.rolesLoading")}</div>
      ) : rolesError ? (
        <div className="p-6">
          <p className="text-sm text-error">{rolesError}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-border bg-surface2/70">
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3">{t("permissions.colRole")}</th>
                <th className="px-4 py-3">{t("permissions.colStatus")}</th>
                <th className="px-4 py-3">{t("permissions.colPermCount")}</th>
                <th className="sticky right-0 z-20 bg-surface2/70 px-4 py-3 text-right">{t("permissions.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.role}
                    className="group border-b border-border last:border-b-0 transition-colors hover:bg-surface2/50"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium text-text">{role.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          role.isActive ? "bg-primary/15 text-primary" : "bg-error/15 text-error"
                        }`}
                      >
                        {role.isActive ? t("common.active") : t("common.passive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text2">
                      {role.permissions.length} {t("permissions.permissionCountSuffix")}
                    </td>
                    <td className="sticky right-0 z-10 bg-surface px-4 py-3 text-right group-hover:bg-surface2/50">
                      <div className="inline-flex items-center gap-1">
                        {canManage && (
                          <IconButton
                            onClick={() => void onEditRole(role)}
                            aria-label={t("permissions.editRoleAction")}
                            title={t("permissions.editRoleTitle")}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
