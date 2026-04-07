"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    fetchDcsMapLocations,
    dcsEnvelopeToMapPoints,
    fetchMapPoints,
    DEFAULT_DCS_MAP_NAME,
    type MapLocationPoint,
} from "@/lib/api";
import { getFallbackMapPoints } from "@/lib/locations";

export type UseMapLocationsOptions = {
    // Mongo / DCS map id; defaults to {@link DEFAULT_DCS_MAP_NAME}.
    mapName?: string;
    // When false, no request runs (e.g. drawer closed).
    enabled?: boolean;
};

// Tries live DCS data ({@code GET /api/maps/dcs}), then Mongo ({@code /maps/points}), then {@link getFallbackMapPoints}.
export function useMapLocations(options: UseMapLocationsOptions = {}) {
    const mapName = options.mapName ?? DEFAULT_DCS_MAP_NAME;
    const enabled = options.enabled ?? true;

    const [locations, setLocations] = useState<MapLocationPoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                try {
                    const env = await fetchDcsMapLocations(mapName);
                    const fromDcs = dcsEnvelopeToMapPoints(env);
                    if (!cancelled && fromDcs.length > 0) {
                        setLocations(fromDcs);
                        return;
                    }
                } catch {
                    // DCS proxy unreachable or 502 — try Mongo
                }
                try {
                    const fromMongo = await fetchMapPoints(mapName);
                    if (!cancelled && fromMongo.length > 0) {
                        setLocations(fromMongo);
                        return;
                    }
                } catch {
                    // Mongo failed
                }
                if (!cancelled) {
                    const fb = getFallbackMapPoints(mapName);
                    setLocations(fb);
                    if (fb.length === 0) {
                        toast.error("Không tải được danh sách địa điểm.");
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled, mapName]);

    return { locations, loading } as const;
}
