export enum AssetCategory {
  LAPTOP = 'LAPTOP',
  MONITOR = 'MONITOR',
  PERIPHERAL = 'PERIPHERAL',
  NETWORKING = 'NETWORKING',
  MOBILE = 'MOBILE',
  OTHER = 'OTHER',
}
  
  export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    avatarUrl?: string;
    assetsCount: number;
  }
  
  export interface Asset {
    id: string;
    name: string;
    category: AssetCategory;
    status: AssetStatus;
    assignedTo?: string;
    purchaseDate: string;
    warrantyExpiry: string;
    serialNumber: string;
    imageUrl?: string;
    updatedAt: string;
  }
  
  export interface AssetStats {
    total: number;
    inUse: number;
    available: number;
    maintenance: number;
  }
  