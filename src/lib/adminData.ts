
import { diamonds } from './data';

export const salesData = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
];

export const mockUsers = [
  { id: 'USR-001', name: 'John Doe', email: 'john.d@example.com', role: 'Buyer', company: 'JD Jewelers', dateJoined: '2023-01-15', password: 'password123' },
  { id: 'USR-002', name: 'Jane Smith', email: 'jane.s@example.com', role: 'Buyer', company: 'Smith Fine Gems', dateJoined: '2023-02-20', password: 'password123' },
  { id: 'USR-003', name: 'Supplier One', email: 'contact@supplierone.com', role: 'Supplier', company: 'Global Diamond Source', dateJoined: '2023-03-10', password: 'password123' },
  { id: 'USR-004', name: 'Peter Jones', email: 'peter.j@example.com', role: 'Buyer', company: 'The Diamond Galleria', dateJoined: '2023-04-05', password: 'password123' },
  { id: 'USR-005', name: 'Supplier Two', email: 'sales@suppliertwo.net', role: 'Supplier', company: 'Prestige Gems Co.', dateJoined: '2023-05-21', password: 'password123' },
  { id: 'USR-006', name: 'Ganesh', email: 'ganesh@ganesh.com', role: 'Supplier', company: 'Ganesh Gems', dateJoined: '2024-01-01', password: 'ganesh@ganesh.com' },
  { id: 'USR-007', name: 'Alice Williams', email: 'buyer1@example.com', role: 'Buyer', company: 'Williams Diamonds', dateJoined: '2024-02-10', password: 'password123' },
  { id: 'USR-008', name: 'Bob Brown', email: 'buyer2@example.com', role: 'Buyer', company: 'Brown & Co. Fine Jewelry', dateJoined: '2024-02-15', password: 'password123' },
  { id: 'USR-009', name: 'Charlie Davis', email: 'buyer3@example.com', role: 'Buyer', company: 'Davis Gems', dateJoined: '2024-03-01', password: 'password123' },
  { id: 'USR-010', name: 'Diana Miller', email: 'buyer4@example.com', role: 'Buyer', company: 'Miller Jewels', dateJoined: '2024-03-05', password: 'password123' },
  { id: 'USR-011', name: 'Eve Wilson', email: 'buyer5@example.com', role: 'Buyer', company: 'Wilson Precious Stones', dateJoined: '2024-03-20', password: 'password123' },
];

export const mockPendingRegistrations = [
    { 
        id: 'REG-001', 
        companyName: 'Crystal Clear Diamonds', 
        companyAddress: '456 Diamond Ave, Suite 200, Gemstone City, 54321',
        registrationNumber: 'UIN-555123',
        contactName: 'Maria Garcia', 
        email: 'maria.g@ccdiamonds.com', 
        role: 'Supplier', 
        date: '2023-11-05', 
        references: 'Reference 1: Gem World Inc, Contact: Bob Smith. Reference 2: Precious Stones Co, Contact: Carol White.'
    },
    { 
        id: 'REG-002', 
        companyName: 'Legacy Jewels',
        companyAddress: '789 Gold Street, Metropolis, 67890',
        registrationNumber: 'N/A (Buyer)',
        contactName: 'David Chen', 
        email: 'd.chen@legacy.com', 
        role: 'Buyer', 
        date: '2023-11-04',
        references: 'Reference: Self-funded, new business.'
    },
];

export const mockAdminOrders = [
  { id: 'ORD-001', product: diamonds[6], buyer: mockUsers[0], supplier: mockUsers[2], date: '2023-10-26', status: 'Pending', total: diamonds[6].price },
  { id: 'ORD-002', product: diamonds[7], buyer: mockUsers[1], supplier: mockUsers[4], date: '2023-10-25', status: 'Shipped', total: diamonds[7].price },
  { id: 'ORD-003', product: diamonds[8], buyer: mockUsers[3], supplier: mockUsers[2], date: '2023-10-24', status: 'Delivered', total: diamonds[8].price },
];
