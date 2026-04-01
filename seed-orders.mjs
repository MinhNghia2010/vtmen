const API = "http://localhost:8081/api/orders/create";

const orders = [
    { fullName: "Nguyen Van A", phone: "0901234567", address: "123 Nguyen Hue, Q1, TP.HCM", note: "iPhone 15 Pro Max", status: "shipping", quantity: 1 },
    { fullName: "Tran Thi B", phone: "0912345678", address: "456 Le Loi, Q3, TP.HCM", note: "Samsung Galaxy S24 Ultra", status: "placed", quantity: 2 },
    { fullName: "Le Van C", phone: "0923456789", address: "789 Hai Ba Trung, Q1, TP.HCM", note: "MacBook Air M3", status: "delivered", quantity: 1 },
    { fullName: "Pham Thi D", phone: "0934567890", address: "12 Vo Van Tan, Q3, TP.HCM", note: "AirPods Pro 2", status: "delivered", quantity: 3 },
    { fullName: "Hoang Van E", phone: "0945678901", address: "34 Ly Tu Trong, Q1, TP.HCM", note: "iPad Pro M4", status: "placed", quantity: 1 },
    { fullName: "Vo Thi F", phone: "0956789012", address: "56 CMT8, Q10, TP.HCM", note: "Dell XPS 15", status: "delivered", quantity: 1 },
    { fullName: "Dang Van G", phone: "0967890123", address: "78 Dien Bien Phu, Binh Thanh, TP.HCM", note: "Sony WH-1000XM5", status: "pending", quantity: 2 },
    { fullName: "Bui Thi H", phone: "0978901234", address: "90 Nguyen Dinh Chieu, Q3, TP.HCM", note: "Apple Watch Ultra 2", status: "shipping", quantity: 1 },
    { fullName: "Ngo Van I", phone: "0989012345", address: "102 Pasteur, Q1, TP.HCM", note: "Xiaomi 14 Ultra", status: "pending", quantity: 1 },
    { fullName: "Do Thi K", phone: "0990123456", address: "204 Cach Mang Thang 8, Q3, TP.HCM", note: "Logitech MX Master 3S", status: "pending", quantity: 4 },
    { fullName: "Truong Van L", phone: "0901122334", address: "55 Nguyen Trai, Q5, TP.HCM", note: "Samsung Galaxy Tab S9", status: "shipping", quantity: 1 },
    { fullName: "Ly Thi M", phone: "0912233445", address: "77 Le Van Sy, Phu Nhuan, TP.HCM", note: "Google Pixel 8 Pro", status: "placed", quantity: 2 },
];

async function seed() {
    let success = 0;
    for (const order of orders) {
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
            });
            if (res.ok) {
                const data = await res.json();
                console.log(`Created: ${data.orderCode || data.id} - ${order.note}`);
                success++;
            } else {
                console.log(`Failed: ${order.note} (${res.status})`);
            }
        } catch (err) {
            console.log(`Error: ${order.note} - ${err.message}`);
        }
    }
    console.log(`\nDone! ${success}/${orders.length} orders created.`);
}

seed();
