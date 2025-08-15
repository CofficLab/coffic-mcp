<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

  interface Props {
    images: string[];
    size?: 'sm' | 'md' | 'lg';
    showPreview?: boolean;
    maxDisplay?: number;
  }

  interface Emits {
    (e: 'imageClick', imageUrl: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    showPreview: true,
    maxDisplay: 4,
  });

  const emit = defineEmits<Emits>();

  // 预览状态
  const previewState = ref({
    visible: false,
    imageUrl: '',
  });

  // 获取尺寸类名
  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-24 h-24',
    };
    return sizeMap[props.size];
  };

  // 处理图片点击
  const handleImageClick = (imageUrl: string) => {
    if (props.showPreview) {
      previewState.value = {
        visible: true,
        imageUrl,
      };
    } else {
      emit('imageClick', imageUrl);
    }
  };

  // 关闭预览
  const closeModal = () => {
    previewState.value.visible = false;
  };

  // 在新窗口打开图片
  const openInNewWindow = () => {
    window.open(previewState.value.imageUrl, '_blank');
  };

  // 键盘事件处理
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  // 点击背景关闭
  const handleBackgroundClick = (e: Event) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // 保存原始滚动状态
  let originalOverflow = '';

  // 禁止背景滚动
  const disableScroll = () => {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  };

  // 恢复背景滚动
  const enableScroll = () => {
    document.body.style.overflow = originalOverflow;
  };

  // 生命周期钩子
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    // 确保在组件销毁时恢复滚动
    enableScroll();
  });

  // 监听 visible 变化，控制滚动
  watch(
    () => previewState.value.visible,
    (newVisible: boolean) => {
      if (newVisible) {
        disableScroll();
      } else {
        enableScroll();
      }
    }
  );

  // 处理图片加载错误
  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';

    // 创建错误占位符
    const placeholder = document.createElement('div');
    placeholder.className = `${getSizeClasses()} bg-gray-200 rounded border border-gray-300 flex items-center justify-center`;
    placeholder.innerHTML = `
      <div class="text-center">
        <div class="text-gray-500 text-xs">加载失败</div>
      </div>
    `;

    // 插入到图片位置
    img.parentNode?.insertBefore(placeholder, img);
  };

  // 计算显示的图片数量
  const displayImages = computed(() => {
    return props.images.slice(0, props.maxDisplay);
  });

  // 是否有更多图片
  const hasMoreImages = computed(() => {
    return props.images.length > props.maxDisplay;
  });
</script>

<template>
  <div class="space-y-2">
    <!-- 图片网格 -->
    <div class="flex flex-wrap gap-2">
      <div
        v-for="(imageUrl, index) in displayImages"
        :key="index"
        class="relative group cursor-pointer"
        @click="handleImageClick(imageUrl)">
        <!-- 图片 -->
        <img
          :src="imageUrl"
          :alt="`图片 ${index + 1}`"
          :class="`${getSizeClasses()} object-cover rounded border border-gray-200 hover:scale-105 transition-transform duration-200`"
          @error="handleImageError" />

        <!-- 悬停遮罩 -->
        <div
          class="absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center pointer-events-none">
          <span class="text-white text-xs opacity-0 group-hover:opacity-100"
            >点击查看</span
          >
        </div>
      </div>

      <!-- 更多图片提示 -->
      <div
        v-if="hasMoreImages"
        :class="`${getSizeClasses()} bg-gray-100 rounded border border-gray-200 flex items-center justify-center`">
        <div class="text-center">
          <div class="text-gray-500 text-xs">
            +{{ props.images.length - props.maxDisplay }}
          </div>
          <div class="text-gray-400 text-xs">更多</div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div
          v-if="previewState.visible && showPreview"
          class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          @click="handleBackgroundClick">
          <div class="relative max-w-4xl max-h-full p-4">
            <!-- 图片容器 -->
            <div class="relative">
              <img
                :src="previewState.imageUrl"
                :alt="`图片预览`"
                class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                @error="closeModal" />

              <!-- 关闭按钮 -->
              <button
                @click="closeModal"
                class="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center">
                ×
              </button>
            </div>

            <!-- 底部操作栏 -->
            <div
              class="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <!-- 新窗口打开链接 -->
              <button
                @click="openInNewWindow"
                class="text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded hover:bg-opacity-70 transition-colors duration-200">
                在新窗口打开
              </button>

              <!-- 图片信息 -->
              <div
                class="text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
                <span class="text-gray-300">ESC</span> 关闭预览
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
  /* 确保图片容器样式正确 */
  .group:hover .group-hover\:bg-opacity-20 {
    background-color: rgba(0, 0, 0, 0.2);
  }

  /* 确保模态框在最上层 */
  .z-50 {
    z-index: 9999;
  }
</style>
