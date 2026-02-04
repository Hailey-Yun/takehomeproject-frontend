import { apiGet, apiPost } from "./client";
import type { Filters } from "../types/filter";

export async function saveFilters(userId: string, filters: Filters) {
  return apiPost("/saved-filters", { userId, filters });
}

export async function loadFilters(userId: string) {
  return apiGet<Filters>("/saved-filters", { userId });
}
