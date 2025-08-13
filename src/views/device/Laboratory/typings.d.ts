// 实验室类型定义
export interface Laboratory {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  describe?: string;
  deviceCount?: number;
  createTime?: number;
  updateTime?: number;
}

// 科室类型定义
export interface Department {
  id: string;
  name: string;
  parentId?: string;
  describe?: string;
  createTime?: number;
  updateTime?: number;
  children?: Department[];
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
