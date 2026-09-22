<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  code: string;
}>();

const container = ref<HTMLElement>();
const error = ref('');

async function renderDiagram() {
  if (!container.value) {
    return;
  }

  try {
    const { renderMermaidSVG } = await import('beautiful-mermaid');
    container.value.innerHTML = renderMermaidSVG(props.code, {
      bg: 'var(--vp-c-bg)',
      fg: 'var(--vp-c-text-1)',
      accent: 'var(--vp-c-brand-1)',
      transparent: true
    });
    error.value = '';
  } catch (renderError) {
    error.value =
      renderError instanceof Error
        ? renderError.message
        : 'Unable to render Mermaid diagram.';
  }
}

onMounted(() => {
  void renderDiagram();
});
</script>

<template>
  <div
    v-show="!error"
    ref="container"
    class="mermaid-diagram"
  />
  <p
    v-if="error"
    class="mermaid-diagram__error"
  >
    {{ error }}
  </p>
</template>

<style scoped>
.mermaid-diagram {
  overflow-x: auto;
  text-align: center;
}

.mermaid-diagram :deep(svg) {
  height: auto;
  min-width: 1100px;
}

.mermaid-diagram__error {
  color: var(--vp-c-danger-1);
}
</style>
