"use client";

import { useState, type ReactNode } from "react";
import { mediaUrl, uploadFile } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  icon: ReactNode;
  disabled?: boolean;
  accept?: string;
};

/**
 * Shared image picker — uploads through our API which proxies to ImageLab
 * (secret key never leaves the server). See https://imagelab.site/docs
 */
export function ImageUploadSlot({
  label,
  value,
  onChange,
  icon,
  disabled,
  accept = "image/*",
}: Props) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(file?: File | null) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const uploaded = await uploadFile(file);
      onChange(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("memberForm.uploadFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-36 items-center justify-center bg-slate-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(value)} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-slate-300">{icon}</span>
        )}
      </div>
      <div className="bg-[#1e3a5f] px-3 py-2 text-center text-xs font-semibold text-white">{label}</div>
      <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy || disabled}
          onChange={(e) => {
            void onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {busy ? t("common.loading") : t("memberForm.chooseFile")}
      </label>
      {error ? <p className="px-2 pb-2 text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
