"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  LogOut,
  Menu,
  MoreVertical,
  Search,
  Sparkles,
} from "lucide-react";
import { CHAIR_NAV } from "@/components/dashboard/nav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { api } from "@/lib/api";
import { formatCount, formatDashboardDate } from "@/lib/format";
import type { DashboardSummary, User } from "@/types";

function somitiLabel(user: User, fallback: string) {
  return user.somiti && typeof user.somiti === "object" ? user.somiti.name : fallback;
}

function initialOf(name: string) {
  return name.trim().slice(0, 1) || "স";
}

function pathMatches(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const { t, locale } = useI18n();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState({ overdueInstallments: 0, notifications: 0 });
  const [openNav, setOpenNav] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api<DashboardSummary>("/dashboard/summary")
      .then((res) => {
        setMetrics({
          overdueInstallments: res.data.metrics?.overdueInstallments ?? 0,
          notifications: res.data.metrics?.notifications ?? 0,
        });
      })
      .catch(() => undefined);
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAIR_NAV.filter((item) => item.roles.includes(user.role)).filter((item) => {
      if (!q) return true;
      const parent = t(`chair.nav.${item.key}`).toLowerCase();
      if (parent.includes(q)) return true;
      return (item.children ?? []).some((child) =>
        t(`chair.navChild.${child.key}`).toLowerCase().includes(q)
      );
    });
  }, [query, t, user.role]);

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  const overdueInstallments = metrics.overdueInstallments;
  const notifications = metrics.notifications;

  const sidebar = (
    <div className="flex h-full flex-col select-none">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xl font-bold tracking-tight text-white shadow-md shadow-emerald-500/20">
            স
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-base font-bold leading-tight text-slate-900">
                {t("brand.name")}
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                  {t("chair.pro")}
                </span>
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {somitiLabel(user, t("brand.tagline"))}
              </p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:inline-flex"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? t("chair.expand") : t("chair.collapse")}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {!collapsed ? (
        <div className="px-4 pb-1 pt-3">
          <label className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("chair.search")}
              className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-2 pl-9 pr-14 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <kbd className="absolute right-2.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </label>
        </div>
      ) : null}

      <nav className="chair-scroll flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div>
          {!collapsed ? (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {t("chair.menuSection")}
            </p>
          ) : (
            <div className="h-2" />
          )}
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const childActive = (item.children ?? []).some((child) => pathMatches(pathname, child.href));
              const active = pathMatches(pathname, item.href) || childActive;
              const overdue = item.badge === "overdue" && overdueInstallments > 0;
              const notify = item.badge === "notify" && notifications > 0;
              const expanded = query
                ? true
                : item.key in openNav
                  ? openNav[item.key]
                  : childActive;

              if (!item.children || collapsed) {
                const href = item.href ?? item.children?.[0]?.href ?? "/dashboard";
                return (
                  <li key={item.key}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? t(`chair.nav.${item.key}`) : undefined}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-emerald-50 font-semibold text-emerald-800"
                          : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} className={active ? "text-emerald-600" : "text-slate-400"} />
                        {!collapsed ? <span>{t(`chair.nav.${item.key}`)}</span> : null}
                      </span>
                      {!collapsed && overdue ? (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                          {formatCount(overdueInstallments, locale)} {t("chair.overdueShort")}
                        </span>
                      ) : null}
                      {!collapsed && notify ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {formatCount(notifications, locale)}
                        </span>
                      ) : null}
                      {active && !collapsed && !overdue && !notify ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      ) : null}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.key}>
                  <details
                    className="group"
                    open={expanded}
                    onToggle={(event) => {
                      if (query) return;
                      setOpenNav((current) => ({
                        ...current,
                        [item.key]: (event.target as HTMLDetailsElement).open,
                      }));
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-900">
                      <span className="flex items-center gap-3">
                        <Icon size={16} className={active ? "text-emerald-600" : "text-slate-400"} />
                        <span>{t(`chair.nav.${item.key}`)}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        {overdue ? (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                            {formatCount(overdueInstallments, locale)} {t("chair.overdueShort")}
                          </span>
                        ) : null}
                        {notify ? (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {formatCount(notifications, locale)}
                          </span>
                        ) : null}
                        <ChevronRight
                          size={14}
                          className="text-slate-400 transition-transform group-open:rotate-90"
                        />
                      </span>
                    </summary>
                    <div className="space-y-1 py-1 pl-9 pr-2 text-xs text-slate-600">
                      {item.children.map((child) => (
                        <Link
                          key={`${child.key}-${child.href}`}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block py-1 hover:text-emerald-700 hover:underline ${
                            pathMatches(pathname, child.href) ? "font-semibold text-emerald-700" : ""
                          }`}
                        >
                          {t(`chair.navChild.${child.key}`)}
                        </Link>
                      ))}
                    </div>
                  </details>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={signOut}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 ${
                  collapsed ? "justify-center px-2" : ""
                }`}
              >
                <LogOut size={16} className="text-rose-500" />
                {!collapsed ? <span>{t("common.signOut")}</span> : null}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {!collapsed ? (
        <Link
          href="/dashboard/billing"
          className="mx-3 mb-2 flex items-center justify-between rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 p-3"
        >
          <span className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
              <Sparkles size={14} />
            </span>
            <span>
              <span className="block text-xs font-bold leading-tight text-slate-900">
                {t("chair.upgradeTitle")}
              </span>
              <span className="block text-[11px] text-slate-500">{t("chair.upgradeBody")}</span>
            </span>
          </span>
          <ChevronRight size={16} className="text-amber-600" />
        </Link>
      ) : null}

      <div className="flex items-center justify-between border-t border-slate-200/70 bg-slate-50/50 p-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? "w-full justify-center" : ""}`}>
          <span className="relative">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-600 text-sm font-semibold text-white shadow-sm ring-2 ring-white">
              {initialOf(user.name)}
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none text-slate-900">{user.name}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {t("chair.headOffice")} ({t("chair.main")})
              </p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600">
            <MoreVertical size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 lg:flex">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label={t("chair.closeMenu")}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 border-r border-slate-200/80 bg-white transition-transform lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          collapsed ? "lg:w-[76px]" : "lg:w-72"
        } w-72 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t("chair.menuSection")}
            >
              <Menu size={18} />
            </button>
            <p className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3.5 py-1.5 text-sm text-slate-700">
              <CalendarDays size={15} className="text-emerald-600" />
              <span>
                {t("chair.todayLabel")}{" "}
                <span className="font-bold text-slate-900">{formatDashboardDate(new Date(), locale)}</span>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500"
              aria-label={t("chair.nav.notifications")}
            >
              <Bell size={16} />
              {notifications > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {formatCount(notifications, locale)}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex"
            >
              {t("chair.headOffice")} ▾
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  {initialOf(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-bold leading-tight text-slate-800">{user.name}</span>
                  <span className="block text-[10px] text-slate-400">{t(`roles.${user.role}.short`)} ▾</span>
                </span>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut size={14} />
                    {t("common.signOut")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="chair-scroll flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
