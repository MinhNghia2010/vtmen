/**
 * Map POIs: live DCS via {@link fetchDcsMapLocations}, Mongo {@link fetchMapPoints}, static {@link ./locations.ts}.
 */
export {
    DEFAULT_DCS_MAP_NAME,
    fetchMapPoints,
    fetchDcsMapLocations,
    dcsEnvelopeToMapPoints,
    type MapLocationPoint,
    type DcsLocationsEnvelope,
    type DcsMapPoint,
} from "./api";
export { getFallbackMapPoints, FALLBACK_CAMPUS_MAP_NAME } from "./locations";
export {
    useMapLocations,
    type UseMapLocationsOptions,
} from "@/hooks/use-map-locations";
