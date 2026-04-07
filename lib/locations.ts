import type { MapLocationPoint } from "./api";

// Must match backend `vtmen.dcs.map-name` and `CampusMapSeedCatalog`.
export const FALLBACK_CAMPUS_MAP_NAME = "Trường đại học";

// Same POIs as {@code CampusMapSeedCatalog} — used when API has no points or is unreachable.
const TRUONG_DAI_HOC_ROWS: readonly { name: string; address: string }[] = [
    { name: "Đại học Bách Khoa Hà Nội", address: "1 Đại Cồ Việt, Hai Bà Trưng" },
    { name: "Đại học Thủy Lợi", address: "175 Tây Sơn, Đống Đa" },
    { name: "Đại học Quốc gia Hà Nội", address: "144 Xuân Thủy, Cầu Giấy" },
    { name: "Học viện Bưu chính Viễn thông", address: "Km10 Nguyễn Trãi, Hà Đông" },
    { name: "Đại học Công nghệ - ĐHQGHN", address: "144 Xuân Thủy, Cầu Giấy" },
    { name: "Đại học Kinh tế Quốc dân", address: "207 Giải Phóng, Hai Bà Trưng" },
    { name: "Đại học Xây dựng Hà Nội", address: "55 Giải Phóng, Hai Bà Trưng" },
    { name: "Đại học Giao thông Vận tải", address: "3 Cầu Giấy, Láng Thượng" },
    { name: "Đại học Sư phạm Hà Nội", address: "136 Xuân Thủy, Cầu Giấy" },
    { name: "Học viện Kỹ thuật Quân sự", address: "236 Hoàng Quốc Việt" },
    { name: "Học viện Ngân hàng", address: "12 Chùa Bộc, Đống Đa" },
    { name: "Đại học Thương mại", address: "79 Hồ Tùng Mậu" },
    { name: "Đại học Hà Nội", address: "Km9 Nguyễn Trãi, Nam Từ Liêm" },
    { name: "Đại học Mỏ - Địa chất", address: "18 Phố Viên, Bắc Từ Liêm" },
    { name: "Đại học FPT", address: "Khu Công nghệ cao Hòa Lạc" },
    { name: "Học viện Tài chính", address: "58 Lê Văn Hiến, Bắc Từ Liêm" },
    { name: "Đại học Phenikaa", address: "Yên Nghĩa, Hà Đông" },
    { name: "Đại học Kiến trúc Hà Nội", address: "Km10 Nguyễn Trãi, Hà Đông" },
    { name: "Đại học Điện lực", address: "235 Hoàng Quốc Việt" },
    { name: "Đại học Lao động Xã hội", address: "43 Trần Duy Hưng, Cầu Giấy" },
];

export function getFallbackMapPoints(mapName?: string): MapLocationPoint[] {
    const key = (mapName ?? FALLBACK_CAMPUS_MAP_NAME).trim();
    if (key !== FALLBACK_CAMPUS_MAP_NAME) return [];
    return TRUONG_DAI_HOC_ROWS.map((row, i) => ({
        id: i,
        name: row.name,
        address: row.address,
    }));
}
