// 实验室类型定义
export interface Laboratory {
  id: string;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  email?: string;
  describe?: string;
  deviceCount?: number;
  parentId?: string;
  path?: string;
  sortIndex?: number;
  level?: number;
  createTime?: number;
  updateTime?: number;
  children?: Laboratory[];
}

// 实验室设备关联类型定义
export interface LaboratoryDevice {
  id: string;
  laboratoryId: string;
  deviceId: string;
  deviceName?: string;
  productName?: string;
  state?: {
    value: string;
    text: string;
  };
  createTime?: number;
}
