import { request } from '@/utils/request';

// 实验室管理API
export const LaboratoryAPI = {
  // 获取实验室列表
  query: (params: any) =>
    request('/device/laboratory/_query', {
      method: 'POST',
      data: params,
    }),

  // 新增实验室
  save: (data: any) =>
    request('/device/laboratory', {
      method: 'POST',
      data,
    }),

  // 更新实验室
  update: (id: string, data: any) =>
    request(`/device/laboratory/${id}`, {
      method: 'PUT',
      data,
    }),

  // 删除实验室
  remove: (id: string) =>
    request(`/device/laboratory/${id}`, {
      method: 'DELETE',
    }),

  // 获取实验室详情
  detail: (id: string) =>
    request(`/device/laboratory/${id}`, {
      method: 'GET',
    }),

  // 获取实验室树形结构
  tree: (params?: any) =>
    request('/device/laboratory/_tree', {
      method: 'GET',
      params,
    }),

  // 获取实验室下的设备列表
  devices: (laboratoryId: string, params?: any) =>
    request(`/device/laboratory/${laboratoryId}/devices`, {
      method: 'GET',
      params,
    }),

  // 分配设备到实验室
  assignDevice: (laboratoryId: string, deviceIds: string[]) =>
    request(`/device/laboratory/${laboratoryId}/devices`, {
      method: 'POST',
      data: { deviceIds },
    }),

  // 移除实验室中的设备
  removeDevice: (laboratoryId: string, deviceIds: string[]) =>
    request(`/device/laboratory/${laboratoryId}/devices`, {
      method: 'DELETE',
      data: { deviceIds },
    }),
};


