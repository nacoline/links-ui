<template>
    <j-spin :spinning="loading">
    <div style="width: 100%; height: 500px">
        <!-- Trajectory chart -->
        <Chart :options="options" v-if="trajectoryData.length" />
        <JEmpty v-else />
    </div>
    </j-spin>
</template>

<script lang="ts" setup>
// import { ref, computed, watchEffect, watch } from 'vue';
import { useInstanceStore } from '@/store/instance';
import { getPropertyData } from '@/api/device/instance';
import { getPropertiesInfo, getPropertiesList } from '@/api/device/instance';
// import { getTrajectoryData } from '@/api/device/instance'; // 假设这里有获取轨迹数据的接口
// import Chart from './Chart.vue';
// import * as echarts from 'echarts';

// 接收父组件传递的数据（包含时间和坐标）
const prop = defineProps({
data: {
    type: Object,
    default: () => {},
},
time: {
    type: Array,
    default: () => [],
},
});

// 存储轨迹数据
const trajectoryData = ref<any[]>([]);

// 控制加载状态
const loading = ref<boolean>(false);

// 设置图表选项
const options = ref({});

// 获取当前设备实例
const instanceStore = useInstanceStore();

// 获取轨迹数据的函数
const fetchTrajectoryData = async () => {
    loading.value = true;
    const resp = await getPropertiesList(
        instanceStore.current.id,  // 第一个参数，设备的 ID
        prop.data.id,
        {
            paging: false,
            terms: [
                {
                    column: 'timestamp$BTW',
                    value: prop.time[0] && prop.time[1] ? [prop.time[0], prop.time[1]] : [],
                    type: 'and',
                },
            ],
            sorts: [{ name: 'timestamp', order: 'asc' }],
        }  // 第二个参数，查询条件
    );
    loading.value = false;
    
    if (resp.status === 200) {
        console.log("----------data---------------")
        console.log(data)
        const dataList = resp.result?.data?.map((item: any) => ({
            timestamp: item.timestamp,
            x: item.temperature,  // 假设这里有 x 坐标
            y: item.temperature,  // 假设这里有 y 坐标
        })) || [];
        trajectoryData.value = dataList;
    }
};

// 生成 ECharts 配置
const generateChartOptions = (data: any[]) => {
options.value = {
xAxis: {
    type: 'category',
    data: data.map((item) => item.timestamp), // 时间戳作为 X 轴
    name: '时间',
},
yAxis: {
  type: 'value',
  name: '坐标',
},
series: [
  {
    type: 'scatter', // 使用散点图表示坐标
    data: data.map((item) => [item.x, item.y]),
    symbolSize: 8,
    itemStyle: {
      color: '#FF0000', // 设置点的颜色
    },
  },
],
tooltip: {
  trigger: 'item',
  formatter: (params: any) => {
    return `时间: ${params.name}<br/>X: ${params.data[0]}<br/>Y: ${params.data[1]}`;
  },
},
dataZoom: [
  {
    type: 'inside',
    start: 0,
    end: 100,
  },
  {
    start: 0,
    end: 100,
  },
],
};
};

// 监听时间变化，重新加载数据
watchEffect(() => {
  if (prop.time.length) {
    fetchTrajectoryData();
  }
});

// 监听数据变化，更新图表
watch(trajectoryData, (newData) => {
  if (newData.length) {
    generateChartOptions(newData);
  }
});

</script>

<style scoped lang="less">
/* 自定义样式 */
</style>
