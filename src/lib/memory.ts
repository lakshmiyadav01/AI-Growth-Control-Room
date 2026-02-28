import { Campaign } from "./types";

const STORAGE_KEY = "ai_growth_control_room_campaigns";

export function saveCampaign(campaign: Campaign): void {
    if (typeof window === "undefined") return;
    const existing = loadCampaigns();
    const index = existing.findIndex((c) => c.id === campaign.id);
    let updated;
    if (index !== -1) {
        existing[index] = campaign;
        updated = [...existing];
    } else {
        updated = [campaign, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function loadCampaigns(): Campaign[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored) as Campaign[];
    } catch (e) {
        console.error("Failed to parse campaigns from local storage", e);
        return [];
    }
}

export function deleteCampaign(id: string): void {
    if (typeof window === "undefined") return;
    const existing = loadCampaigns();
    const updated = existing.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
