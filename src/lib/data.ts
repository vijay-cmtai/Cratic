
export type Diamond = {
  id: number;
  igi: string;
  stockId: string;
  supplierId: string;
  type: 'Natural' | 'Lab-Grown';
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  measurements: string;
  details: string;
  tags: string[];
  price: number;
  discount: number;
  image: string;
  videoUrl?: string;
  hint: string;
  hasVideo: boolean;
  isReturnable: boolean;
  isMyStock: boolean;
  fluorescence: string;
  polish: string;
  symmetry: string;
  certification: string;
};

const imageUrls = [
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=BAG-8-4',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=BAG-8-4',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=BAG-8-4',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=BAG-8-4',
  'https://v360.diamonds/u/cbb2c21b-aaa8-49b4-b6aa-b2db2bc1547b?m=t',
  'https://v360.diamonds/u/cbb2c21b-aaa8-49b4-b6aa-b2db2bc1547b?m=t',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TR-46-46',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TR-46-46',
  'https://v360.diamonds/u/cbb2c21b-aaa8-49b4-b6aa-b2db2bc1547b?m=t',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TRI-61-61-61',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TRI-61-61-61',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TRI-61-61-61',
  'https://data1.360view.link/data/1/imaged/2205245-AM16-16C-AM16-35B/still.jpg',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TRI-550-550',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=t&a=TRI-550-550',
  'https://data1.360view.link/data/1/imaged/2501255-GD27-212AAAA/still.jpg',
];

const videoUrls = [
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=BAG-8-4',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=BAG-8-4',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=BAG-8-4',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=BAG-8-4',
  'https://v360.diamonds/u/cbb2c21b-aaa8-49b4-b6aa-b2db2bc1547b?m=d',
  'https://v360.diamonds/u/cbb2c21b-aaa8-49b4-b6aa-b2db2bc1547b?m=d',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TR-46-46',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TR-46-46',
  'https://v360.diamonds/u/cbb2c21b-aaa8-49b4-b6aa-b2db2bc1547b?m=d',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TRI-61-61-61',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TRI-61-61-61',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TRI-61-61-61',
  'https://workshop.360view.link/360viewer/360view.html?d=2205245-AM16-16C-AM16-35B',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TRI-550-550',
  'https://v360.diamonds/c/60fd13ee-cf42-4d6d-8ca1-b0c09ae9b2a5?m=d&a=TRI-550-550',
  'https://workshop.360view.link/360viewer/360view.html?d=2501255-GD27-212AAAA',
];

export const diamonds: Diamond[] = [
  // Natural Diamonds - Supplier One (SUP-001)
  { id: 1, type: 'Natural', supplierId: 'SUP-001', igi: '587305301', stockId: '1259-156A', shape: 'Round', carat: 0.5, color: 'F', clarity: 'VS1', cut: 'Excellent', measurements: '5.07-5.09 x 3.18', details: 'T 58% D 63% R 1.00', tags: ['No shade', 'Excellent luster', '100% eye clean'], price: 875.38, discount: 87.48, image: imageUrls[0], videoUrl: videoUrls[0], hint: 'round diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'IGI' },
  { id: 2, type: 'Natural', supplierId: 'SUP-001', igi: '585320032', stockId: '128-66A', shape: 'Round', carat: 0.5, color: 'E', clarity: 'VS1', cut: 'Excellent', measurements: '5.04-5.08 x 3.17', details: 'T 59% D 62% R 0.99', tags: ['No shade', 'Excellent luster', '100% eye clean'], price: 966.51, discount: 82.72, image: imageUrls[1], videoUrl: videoUrls[1], hint: 'round diamond', hasVideo: true, isReturnable: true, isMyStock: true, fluorescence: 'Faint', polish: 'Very Good', symmetry: 'Excellent', certification: 'IGI' },
  { id: 3, type: 'Natural', supplierId: 'SUP-002', igi: '585319963', stockId: '131-9A', shape: 'Round', carat: 0.5, color: 'E', clarity: 'VS1', cut: 'Excellent', measurements: '5.05-5.11 x 3.17', details: 'T 56% D 63% R 0.99', tags: ['No shade', 'Excellent luster', '100% eye clean'], price: 976.56, discount: 77.18, image: imageUrls[2], videoUrl: videoUrls[2], hint: 'round diamond', hasVideo: true, isReturnable: false, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Very Good', certification: 'GIA' },
  { id: 4, type: 'Natural', supplierId: 'SUP-002', igi: '574334473', stockId: '287806', shape: 'Round', carat: 0.51, color: 'E', clarity: 'VS1', cut: 'Excellent', measurements: '5.10-5.12 x 3.20', details: 'T 58% D 63% R 0.99', tags: ['No shade', 'Excellent luster', '100% eye clean'], price: 1017.56, discount: 76.02, image: imageUrls[3], videoUrl: videoUrls[3], hint: 'round diamond', hasVideo: true, isReturnable: false, isMyStock: true, fluorescence: 'Strong', polish: 'Excellent', symmetry: 'Excellent', certification: 'GIA' },
  { id: 5, type: 'Natural', supplierId: 'SUP-001', igi: '1206011112', stockId: 'SN12060', shape: 'Round', carat: 0.53, color: 'E', clarity: 'VS1', cut: 'Excellent', measurements: '5.12-5.16 x 3.21', details: 'T 57% D 62% R 0.99', tags: ['No shade', 'Excellent luster', '100% eye clean'], price: 1054.74, discount: 75.20, image: imageUrls[4], videoUrl: videoUrls[4], hint: 'round diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'Medium', polish: 'Very Good', symmetry: 'Very Good', certification: 'SGL' },
  { id: 6, type: 'Natural', supplierId: 'SUP-001', igi: '587305302', stockId: '1259-157A', shape: 'Princess', carat: 0.72, color: 'G', clarity: 'VVS2', cut: 'Very Good', measurements: '5.50-5.55 x 3.90', details: 'T 68% D 65% R 1.02', tags: ['Faint shade', 'Very good luster'], price: 1250.00, discount: 70.50, image: imageUrls[5], videoUrl: videoUrls[5], hint: 'princess diamond', hasVideo: true, isReturnable: true, isMyStock: true, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'IGI' },

  // Lab-Grown Diamonds - Supplier Two (SUP-002)
  { id: 7, type: 'Lab-Grown', supplierId: 'SUP-002', igi: 'LG600356789', stockId: 'LG-RD-101', shape: 'Round', carat: 1.01, color: 'D', clarity: 'VVS1', cut: 'Excellent', measurements: '6.43-6.46 x 3.97', details: 'Table 57%, Depth 62%', tags: ['No BGM', 'Top Pick'], price: 1850.75, discount: 65.25, image: imageUrls[6], videoUrl: videoUrls[6], hint: 'lab grown round diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'IGI' },
  { id: 8, type: 'Lab-Grown', supplierId: 'SUP-002', igi: 'LG600356790', stockId: 'LG-PR-102', shape: 'Princess', carat: 1.25, color: 'E', clarity: 'VS1', cut: 'Very Good', measurements: '5.90-5.85 x 4.25', details: 'Table 70%, Depth 72%', tags: ['Sharp Corners'], price: 2100.00, discount: 68.00, image: imageUrls[7], videoUrl: videoUrls[7], hint: 'lab grown princess diamond', hasVideo: true, isReturnable: true, isMyStock: true, fluorescence: 'None', polish: 'Excellent', symmetry: 'Very Good', certification: 'GIA' },
  { id: 9, type: 'Lab-Grown', supplierId: 'SUP-001', igi: 'LG600356791', stockId: 'LG-OV-103', shape: 'Oval', carat: 1.52, color: 'F', clarity: 'SI1', cut: 'Excellent', measurements: '8.80 x 6.20 x 3.85', details: 'Table 60%, Depth 62%', tags: ['No Bow-tie'], price: 2500.50, discount: 70.00, image: imageUrls[8], videoUrl: videoUrls[8], hint: 'lab grown oval diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'Faint', polish: 'Excellent', symmetry: 'Excellent', certification: 'IGI' },
  { id: 10, type: 'Lab-Grown', supplierId: 'SUP-001', igi: 'LG600356792', stockId: 'LG-CU-104', shape: 'Cushion', carat: 2.03, color: 'G', clarity: 'VVS2', cut: 'Excellent', measurements: '7.50 x 7.45 x 4.90', details: 'Table 65%, Depth 66%', tags: ['Brilliant Facets'], price: 4200.00, discount: 72.50, image: imageUrls[9], videoUrl: videoUrls[9], hint: 'lab grown cushion diamond', hasVideo: true, isReturnable: false, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'GIA' },
  { id: 11, type: 'Lab-Grown', supplierId: 'SUP-002', igi: 'LG600356793', stockId: 'LG-EM-105', shape: 'Emerald', carat: 2.20, color: 'D', clarity: 'VS2', cut: 'Very Good', measurements: '8.50 x 6.00 x 4.10', details: 'Table 66%, Depth 68%', tags: ['Hall of Mirrors'], price: 4800.00, discount: 75.00, image: imageUrls[10], videoUrl: videoUrls[10], hint: 'lab grown emerald diamond', hasVideo: true, isReturnable: true, isMyStock: true, fluorescence: 'None', polish: 'Very Good', symmetry: 'Excellent', certification: 'IGI' },
  { id: 12, type: 'Lab-Grown', supplierId: 'SUP-001', igi: 'LG600356794', stockId: 'LG-PE-106', shape: 'Pear', carat: 1.76, color: 'E', clarity: 'SI1', cut: 'Excellent', measurements: '10.00 x 6.50 x 4.00', details: 'Table 61%, Depth 61.5%', tags: ['Graceful Shape'], price: 3200.00, discount: 69.00, image: imageUrls[11], videoUrl: videoUrls[11], hint: 'lab grown pear diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'Medium', polish: 'Excellent', symmetry: 'Very Good', certification: 'IGI' },
  { id: 13, type: 'Lab-Grown', supplierId: 'SUP-002', igi: 'LG600356795', stockId: 'LG-RA-107', shape: 'Radiant', carat: 2.50, color: 'F', clarity: 'VVS1', cut: 'Excellent', measurements: '8.00 x 6.50 x 4.30', details: 'Table 67%, Depth 66%', tags: ['Crushed Ice Look'], price: 5500.00, discount: 74.00, image: imageUrls[12], videoUrl: videoUrls[12], hint: 'lab grown radiant diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'GIA' },
  { id: 14, type: 'Lab-Grown', supplierId: 'SUP-001', igi: 'LG600356796', stockId: 'LG-HT-108', shape: 'Heart', carat: 1.43, color: 'G', clarity: 'VS1', cut: 'Very Good', measurements: '7.00 x 7.50 x 4.50', details: 'Table 59%, Depth 60%', tags: ['Romantic Cut'], price: 2800.00, discount: 65.00, image: imageUrls[13], videoUrl: videoUrls[13], hint: 'lab grown heart diamond', hasVideo: true, isReturnable: false, isMyStock: true, fluorescence: 'Faint', polish: 'Very Good', symmetry: 'Very Good', certification: 'IGI' },
  { id: 15, type: 'Lab-Grown', supplierId: 'SUP-002', igi: 'LG600356797', stockId: 'LG-AS-109', shape: 'Asscher', carat: 1.80, color: 'H', clarity: 'VVS2', cut: 'Excellent', measurements: '6.80 x 6.75 x 4.60', details: 'Table 62%, Depth 68%', tags: ['Vintage Appeal'], price: 3500.00, discount: 71.00, image: imageUrls[14], videoUrl: videoUrls[14], hint: 'lab grown asscher diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'SGL' },
  { id: 16, type: 'Lab-Grown', supplierId: 'SUP-001', igi: 'LG600356798', stockId: 'LG-MQ-110', shape: 'Marquise', carat: 1.65, color: 'F', clarity: 'SI2', cut: 'Excellent', measurements: '11.00 x 5.50 x 3.50', details: 'Table 60%, Depth 63%', tags: ['Elegant & Long'], price: 3100.00, discount: 70.00, image: imageUrls[15], videoUrl: videoUrls[15], hint: 'lab grown marquise diamond', hasVideo: true, isReturnable: true, isMyStock: false, fluorescence: 'None', polish: 'Excellent', symmetry: 'Excellent', certification: 'IGI' },
];
