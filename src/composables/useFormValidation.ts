import { computed } from 'vue'

export interface ValidationRule {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
}

export interface ValidationRules {
    [key: string]: ValidationRule
}

export function useFormValidation(rules: ValidationRules) {
    const validateField = (fieldName: string, value: any): string | null => {
        const rule = rules[fieldName]
        if (!rule) return null

        // 必填验证
        if (rule.required && (!value || value.toString().trim() === '')) {
            return `${fieldName} 是必填项`
        }

        // 最小长度验证
        if (rule.minLength && value && value.toString().length < rule.minLength) {
            return `${fieldName} 最少需要 ${rule.minLength} 个字符`
        }

        // 最大长度验证
        if (rule.maxLength && value && value.toString().length > rule.maxLength) {
            return `${fieldName} 最多只能有 ${rule.maxLength} 个字符`
        }

        // 正则表达式验证
        if (rule.pattern && value && !rule.pattern.test(value.toString())) {
            return `${fieldName} 格式不正确`
        }

        // 自定义验证
        if (rule.custom) {
            return rule.custom(value)
        }

        return null
    }

    const validateForm = (formData: Record<string, any>): Record<string, string> => {
        const errors: Record<string, string> = {}

        Object.keys(rules).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName])
            if (error) {
                errors[fieldName] = error
            }
        })

        return errors
    }

    const hasErrors = (errors: Record<string, string>): boolean => {
        return Object.keys(errors).length > 0
    }

    return {
        validateField,
        validateForm,
        hasErrors,
    }
}
