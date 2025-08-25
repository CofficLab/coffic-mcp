<script setup lang="ts">
import { Button, Card, Heading } from '@coffic/cosy-ui/vue';

interface Props {
    images: string[];
    lang: string;
    onOpenImage: (url: string) => void;
}

const props = defineProps<Props>();
</script>

<template>
    <div class="space-y-4">
        <Heading :level="3">
            {{ lang === 'zh-cn' ? '生成结果' : 'Generated Images' }}
        </Heading>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(imageUrl, index) in images" :key="index" class="relative group">
                <Card title="" class="p-2">
                    <img :src="imageUrl" :alt="`${lang === 'zh-cn' ? '生成的图像' : 'Generated image'} ${index + 1
                        }`" class="w-full h-auto rounded-lg shadow-md" loading="lazy" />
                    <div class="mt-2 flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            {{ lang === 'zh-cn' ? '图像' : 'Image' }} {{ index + 1 }}
                        </span>
                        <Button @click="() => onOpenImage(imageUrl)" variant="outline" size="sm">
                            {{ lang === 'zh-cn' ? '查看原图' : 'View Original' }}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 组件特定样式可以在此处添加 */
</style>
