/* =====================================================
   ADORE'S PET - DATA.JS
===================================================== */
let products = [
    { id: "p1", name: "Asian Flemish Giant Rabbit (ফ্লেমিশ জায়ান্ট খরগোশ)", price: 3500, discountPrice: 3200, stock: 5, category: "Rabbit", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500" },
    { id: "p2", name: "Pure Breed French Lop Rabbit (ফ্রেঞ্চ লপ খরগোশ)", price: 4000, discountPrice: 3800, stock: 4, category: "Rabbit", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500" },
    { id: "p3", name: "Cute Netherland Dwarf Bunny (নেদারল্যান্ড ডোয়ার্ফ খরগোশ)", price: 2800, discountPrice: 2500, stock: 6, category: "Rabbit", image: "https://images.unsplash.com/photo-1591380315053-48995574c69d?w=500" },
    { id: "p4", name: "Syrian Hamster (সাইরিয়ান হ্যামস্টার)", price: 600, discountPrice: 500, stock: 10, category: "Hamster", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500" },
    { id: "p5", name: "Campbell Dwarf Hamster (ক্যাম্পবেল ডোয়ার্ফ হ্যামস্টার)", price: 700, discountPrice: 600, stock: 8, category: "Hamster", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500" },
    { id: "p6", name: "Premium Hamster Food Mix 500g (হ্যামস্টার ফুড)", price: 250, discountPrice: 220, stock: 25, category: "Pet Food", image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500" },
    { id: "p7", name: "Rabbit Nipple Drinker Set (খরগোশের পানির ফিডার)", price: 180, discountPrice: 150, stock: 30, category: "Accessories", image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500" }
];

if (!localStorage.getItem("adore_products")) {
    localStorage.setItem("adore_products", JSON.stringify(products));
} else {
    try {
        const stored = JSON.parse(localStorage.getItem("adore_products"));
        if (stored && stored.length > 0) products = stored;
    } catch(e) {}
}
