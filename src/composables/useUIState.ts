import { ref, computed } from 'vue'

export function useUIState() {
    // 加载状态
    const isLoading = ref(false)
    const loadingText = ref('加载中...')

    // 消息提示
    const showMessage = ref(false)
    const messageText = ref('')
    const messageType = ref<'success' | 'error' | 'warning' | 'info'>('info')

    // 模态框状态
    const showModal = ref(false)
    const modalTitle = ref('')
    const modalContent = ref('')

    // 侧边栏状态
    const showSidebar = ref(false)

    // 计算属性
    const isMessageVisible = computed(() => showMessage.value)
    const isModalVisible = computed(() => showModal.value)
    const isSidebarVisible = computed(() => showSidebar.value)

    // 设置加载状态
    const setLoading = (loading: boolean, text?: string) => {
        isLoading.value = loading
        if (text) {
            loadingText.value = text
        }
    }

    // 显示消息
    const showSuccessMessage = (text: string, duration?: number) => {
        messageType.value = 'success'
        messageText.value = text
        showMessage.value = true
    }

    const showErrorMessage = (text: string, duration?: number) => {
        messageType.value = 'error'
        messageText.value = text
        showMessage.value = true
    }

    const showWarningMessage = (text: string, duration?: number) => {
        messageType.value = 'warning'
        messageText.value = text
        showMessage.value = true
    }

    const showInfoMessage = (text: string, duration?: number) => {
        messageType.value = 'info'
        messageText.value = text
        showMessage.value = true
    }

    // 隐藏消息
    const hideMessage = () => {
        showMessage.value = false
    }

    // 显示模态框
    const openModal = (title: string, content: string) => {
        modalTitle.value = title
        modalContent.value = content
        showModal.value = true
    }

    // 隐藏模态框
    const closeModal = () => {
        showModal.value = false
    }

    // 切换侧边栏
    const toggleSidebar = () => {
        showSidebar.value = !showSidebar.value
    }

    // 关闭侧边栏
    const closeSidebar = () => {
        showSidebar.value = false
    }

    return {
        // 状态
        isLoading,
        loadingText,
        showMessage,
        messageText,
        messageType,
        showModal,
        modalTitle,
        modalContent,
        showSidebar,

        // 计算属性
        isMessageVisible,
        isModalVisible,
        isSidebarVisible,

        // 方法
        setLoading,
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
        showInfoMessage,
        hideMessage,
        openModal,
        closeModal,
        toggleSidebar,
        closeSidebar,
    }
}
