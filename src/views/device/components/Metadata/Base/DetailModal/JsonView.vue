<template>
  <div class="json-view-box">
    <div class="json-view-border">
      <j-scrollbar :height="height">
        <JsonViewer :value="value" :expanded="true" :expandDepth="4" />
      </j-scrollbar>
    </div>

  </div>
</template>

<script setup lang="ts" name="JsonView">
import JsonViewer from '@/components/JsonViewer/index.vue';

const props = defineProps({
  value: {
    type: [Object, Array],
    default: () => ({})
  },
  height: {
    type: Number,
    default: 250
  }
})

</script>

<style scoped lang="less">
.json-view-box {
  width: 100%;
  padding-left: 32px;
  .json-view-border {
    border: 1px solid rgba(0,0,0,.15);
    border-radius:2px;
  }
}
</style>