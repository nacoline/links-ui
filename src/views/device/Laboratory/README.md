# 实验室管理功能

## 功能概述

实验室管理功能允许用户创建和管理实验室，并将设备分配到不同的实验室中，实现按科室分类展示设备。

## 主要功能

### 1. 实验室管理
- 新增实验室
- 编辑实验室信息
- 删除实验室
- 查看实验室列表

### 2. 科室管理
- 新增科室
- 编辑科室信息
- 删除科室
- 支持科室层级结构

### 3. 设备分配
- 将设备分配到指定实验室
- 从实验室中移除设备
- 查看实验室下的设备列表

### 4. 设备筛选
- 在设备管理页面按实验室筛选设备

## 文件结构

```
src/views/device/Laboratory/
├── index.vue                 # 实验室管理主页面
├── Save/
│   └── index.vue            # 实验室保存表单
├── Department/
│   ├── index.vue            # 科室管理页面
│   └── DepartmentForm.vue   # 科室表单
├── DeviceList/
│   ├── index.vue            # 设备列表页面
│   └── AssignDevice.vue     # 分配设备页面
├── typings.d.ts             # 类型定义
└── README.md               # 说明文档
```

## API接口

### 实验室管理API
- `LaboratoryAPI.query()` - 查询实验室列表
- `LaboratoryAPI.save()` - 新增实验室
- `LaboratoryAPI.update()` - 更新实验室
- `LaboratoryAPI.remove()` - 删除实验室
- `LaboratoryAPI.devices()` - 获取实验室下的设备
- `LaboratoryAPI.assignDevice()` - 分配设备到实验室
- `LaboratoryAPI.removeDevice()` - 从实验室移除设备

### 科室管理API
- `DepartmentAPI.query()` - 查询科室列表
- `DepartmentAPI.save()` - 新增科室
- `DepartmentAPI.update()` - 更新科室
- `DepartmentAPI.remove()` - 删除科室
- `DepartmentAPI.tree()` - 获取科室树形结构

## 使用说明

1. 在物联网-设备管理菜单下可以看到"实验室"菜单项
2. 点击"实验室"进入实验室管理页面
3. 可以新增、编辑、删除实验室
4. 点击"科室管理"按钮可以管理科室信息
5. 点击实验室的设备数量可以查看和管理该实验室下的设备
6. 在设备管理页面可以通过"所属实验室"筛选条件按实验室筛选设备

## 权限配置

实验室管理功能需要以下权限：
- `device-laboratory` - 实验室管理权限
- `device-department` - 科室管理权限
- `device-instance` - 设备查询权限
