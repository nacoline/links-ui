<template>
  <div class="json-viewer">
    <pre><code>{{ formattedJson }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: any
  expanded?: boolean
  expandDepth?: number
  copyable?: boolean
}>()

const formattedJson = computed(() => {
  try {
    return JSON.stringify(props.value, null, 2)
  } catch (error) {
    return String(props.value)
  }
})
</script>

<style scoped>
.json-viewer {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  max-height: 400px;
}

.json-viewer pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-viewer code {
  color: #333;
}
</style>
