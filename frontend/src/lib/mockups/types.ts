export enum AssetCategory {
    LAPTOP = 'Laptop',
    MONITOR = 'Monitor',
    PERIPHERAL = 'Peripheral',
    NETWORKING = 'Networking',
    MOBILE = 'Mobile',
    OTHER = 'Other',
  }
  
  export enum AssetStatus {
    AVAILABLE = 'Available',
    IN_USE = 'In Use',
    MAINTENANCE = 'Maintenance',
    RETIRED = 'Retired',
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
  