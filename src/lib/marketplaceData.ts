
import { diamonds } from "./data";

// Data for Supplier Portal
export const initialSupplierInventory = [
  { id: 'RNG-001', jewelry_type: 'Ring', metal: '18K Gold', diamond_shape: 'Round', diamond_carat: 1.02, price: 12500, stock: 1, image: 'https://placehold.co/80x80.png', hint: 'gold ring' },
  { id: 'NKL-001', jewelry_type: 'Necklace', metal: 'Platinum', diamond_shape: 'Princess', diamond_carat: 2.5, price: 28000, stock: 3, image: 'https://placehold.co/80x80.png', hint: 'platinum necklace' },
  { id: 'ER-002', jewelry_type: 'Earring', metal: '14K Gold', diamond_shape: 'Cushion', diamond_carat: 0.9, price: 7800, stock: 5, image: 'https://placehold.co/80x80.png', hint: 'gold earring' },
];

export const jewelryTypes = ["Ring", "Necklace", "Earring", "Bracelet", "Pendant", "Nosepin"];
export const metalTypes = ["Gold", "Platinum", "Silver"];
export const metalPurities = ["14K", "18K", "22K", "24K", "950 Platinum"];
export const diamondShapes = ["Round", "Princess", "Oval", "Cushion", "Pear", "Marquise"];
export const certifications = ["GIA", "IGI", "SGL", "None"];
export const occasions = ["Wedding", "Engagement", "Daily Wear", "Gift", "Festive"];

// Assuming this data is for a logged in supplier with ID 'SUP-001'
export const initialSupplierOrders = [
  { id: 'ORD-001', productId: 'RNG-001', buyerId: 'BUYER-08A4', date: '2023-10-26', status: 'Pending', total: 12500 },
  { id: 'ORD-003', productId: 'NKL-001', buyerId: 'BUYER-B2C1', date: '2023-10-24', status: 'Delivered', total: 28000 },
  { id: 'ORD-005', productId: 'RNG-001', buyerId: 'BUYER-9F3D', date: '2023-10-28', status: 'Pending', total: 12500 },
];

// Data for Buyer Portal
export const mockBuyerOrders = {
    pending: [
      { orderId: 'RD-2024-07-01', date: '2024-07-29', diamond: diamonds[4], status: 'Pending Delivery' },
      { orderId: 'RD-2024-07-02', date: '2024-07-28', diamond: diamonds[8], status: 'Pending Delivery' }
    ],
    fulfilled: [
      { orderId: 'RD-2024-06-15', date: '2024-06-20', diamond: diamonds[6], status: 'Fulfilled' }
    ],
    returns: []
};
