export type CheckerType = "comp590" | "comp291-391";

export type CheckerCandidate = {
  where: string;
  score: number;
  bbox_px: number[];
};

export type CheckerHit = {
  label_or_pattern: string | null;
  hit_index: number;
  status: "FOUND" | "NOT_FOUND";
  label_box_px: number[] | null;
  right_roi_px: number[] | null;
  below_roi_px: number[] | null;
  candidates: CheckerCandidate[];
};

export type CheckerPage = {
  page: number;
  page_status: "FOUND" | "NOT_FOUND";
  hits: CheckerHit[];
};

export type CheckerReport = {
  ok: boolean;
  checker: "comp590" | "comp291-391";
  file: string;
  mode: string | null;
  overall_status: "FOUND" | "NOT_FOUND";
  pages: CheckerPage[];
  debug?: { out_dir?: string };
};

import { apiUrl } from "./api";

export async function uploadPdfToChecker(type: CheckerType, file: File, debug = false) {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint =
    type === "comp590" ? "/api/checkers/comp590" : "/api/checkers/comp291-391";

  const url = `${apiUrl(endpoint)}${debug ? "?debug=1" : ""}`;


  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (${res.status})`);
  }

  return (await res.json()) as CheckerReport;
}
