package com.vtmen.backend.bootstrap;

import com.vtmen.backend.model.CampusMapPointEmbedded;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
 // Static POI seeds for maps that should exist in Mongo before the first DCS sync.
 // Add an entry per map name (must match {@code vtmen.dcs.map-name} or other keys you sync under).
public final class CampusMapSeedCatalog {

    private static final Map<String, List<CampusMapPointEmbedded>> BY_MAP_NAME;

    static {
        Map<String, List<CampusMapPointEmbedded>> m = new LinkedHashMap<>();
        m.put("Trường đại học", List.copyOf(truongDaiHocCampusPoints()));
        BY_MAP_NAME = Map.copyOf(m);
    }

    private CampusMapSeedCatalog() {}

    // Map names that have bundled static POIs (see {@link #embeddedPointsForMap}).
    public static Set<String> knownSeedMapKeys() {
        return Collections.unmodifiableSet(BY_MAP_NAME.keySet());
    }
     // Points to insert when Mongo has no document for {@code mapName} and startup seeding runs.
     // @return empty if this map has no bundled seed (e.g. DCS-only map).
    public static Optional<List<CampusMapPointEmbedded>> embeddedPointsForMap(String mapName) {
        if (mapName == null || mapName.isBlank()) {
            return Optional.empty();
        }
        List<CampusMapPointEmbedded> pts = BY_MAP_NAME.get(mapName.trim());
        return pts == null ? Optional.empty() : Optional.of(pts);
    }

    // Matches default {@code vtmen.dcs.map-name} and prior DCS catalog.
    private static List<CampusMapPointEmbedded> truongDaiHocCampusPoints() {
        List<CampusMapPointEmbedded> list = new ArrayList<>();
        add(list, "Đại học Bách Khoa Hà Nội", "1 Đại Cồ Việt, Hai Bà Trưng");
        add(list, "Đại học Thủy Lợi", "175 Tây Sơn, Đống Đa");
        add(list, "Đại học Quốc gia Hà Nội", "144 Xuân Thủy, Cầu Giấy");
        add(list, "Học viện Bưu chính Viễn thông", "Km10 Nguyễn Trãi, Hà Đông");
        add(list, "Đại học Công nghệ - ĐHQGHN", "144 Xuân Thủy, Cầu Giấy");
        add(list, "Đại học Kinh tế Quốc dân", "207 Giải Phóng, Hai Bà Trưng");
        add(list, "Đại học Xây dựng Hà Nội", "55 Giải Phóng, Hai Bà Trưng");
        add(list, "Đại học Giao thông Vận tải", "3 Cầu Giấy, Láng Thượng");
        add(list, "Đại học Sư phạm Hà Nội", "136 Xuân Thủy, Cầu Giấy");
        add(list, "Học viện Kỹ thuật Quân sự", "236 Hoàng Quốc Việt");
        add(list, "Học viện Ngân hàng", "12 Chùa Bộc, Đống Đa");
        add(list, "Đại học Thương mại", "79 Hồ Tùng Mậu");
        add(list, "Đại học Hà Nội", "Km9 Nguyễn Trãi, Nam Từ Liêm");
        add(list, "Đại học Mỏ - Địa chất", "18 Phố Viên, Bắc Từ Liêm");
        add(list, "Đại học FPT", "Khu Công nghệ cao Hòa Lạc");
        add(list, "Học viện Tài chính", "58 Lê Văn Hiến, Bắc Từ Liêm");
        add(list, "Đại học Phenikaa", "Yên Nghĩa, Hà Đông");
        add(list, "Đại học Kiến trúc Hà Nội", "Km10 Nguyễn Trãi, Hà Đông");
        add(list, "Đại học Điện lực", "235 Hoàng Quốc Việt");
        add(list, "Đại học Lao động Xã hội", "43 Trần Duy Hưng, Cầu Giấy");
        return list;
    }

    private static void add(List<CampusMapPointEmbedded> list, String name, String address) {
        list.add(new CampusMapPointEmbedded(name, address, null, null, null));
    }
}
