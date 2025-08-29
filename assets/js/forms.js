// Form Handling and Validation
class FormController {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.submissionHandlers = new Map();
        
        this.init();
    }

    init() {
        this.setupValidationRules();
        this.initializeForms();
        this.setupGlobalFormHandlers();
    }

    setupValidationRules() {
        this.validators.set('required', (value) => {
            return value.trim().length > 0;
        });

        this.validators.set('email', (value) => {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            return emailRegex.test(value);
        });

        this.validators.set('phone', (value) => {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        });

        this.validators.set('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });

        this.validators.set('minLength', (value, minLength) => {
            return value.length >= parseInt(minLength);
        });

        this.validators.set('maxLength', (value, maxLength) => {
            return value.length <= parseInt(maxLength);
        });

        this.validators.set('pattern', (value, pattern) => {
            const regex = new RegExp(pattern);
            return regex.test(value);
        });
    }

    initializeForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            this.registerForm(form);
        });
    }

    registerForm(form) {
        const formId = form.id || `form-${Date.now()}`;
        
        if (!form.id) {
            form.id = formId;
        }

        // Setup form configuration
        const config = {
            element: form,
            fields: new Map(),
            validationRules: new Map(),
            isValid: false,
            submitHandler: null
        };

        // Register form fields
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            this.registerField(config, field);
        });

        // Setup form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(formId);
        });

        this.forms.set(formId, config);
    }

    registerField(formConfig, field) {
        const fieldName = field.name || field.id;
        
        if (!fieldName) return;

        const fieldConfig = {
            element: field,
            validators: [],
            errorElement: null,
            isValid: false,
            value: ''
        };

        // Find or create error element
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            fieldConfig.errorElement = formGroup.querySelector('.error-message') || 
                                     this.createErrorElement(formGroup);
        }

        // Setup validation rules based on attributes
        this.setupFieldValidation(fieldConfig, field);

        // Setup real-time validation
        field.addEventListener('input', () => {
            this.validateField(formConfig, fieldConfig);
        });

        field.addEventListener('blur', () => {
            this.validateField(formConfig, fieldConfig);
        });

        formConfig.fields.set(fieldName, fieldConfig);
    }

    createErrorElement(formGroup) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
        return errorElement;
    }

    setupFieldValidation(fieldConfig, field) {
        // Required validation
        if (field.hasAttribute('required')) {
            fieldConfig.validators.push({
                type: 'required',
                message: 'This field is required'
            });
        }

        // Type-based validation
        switch (field.type) {
            case 'email':
                fieldConfig.validators.push({
                    type: 'email',
                    message: 'Please enter a valid email address'
                });
                break;
            case 'tel':
                fieldConfig.validators.push({
                    type: 'phone',
                    message: 'Please enter a valid phone number'
                });
                break;
            case 'url':
                fieldConfig.validators.push({
                    type: 'url',
                    message: 'Please enter a valid URL'
                });
                break;
        }

        // Attribute-based validation
        if (field.hasAttribute('minlength')) {
            fieldConfig.validators.push({
                type: 'minLength',
                value: field.getAttribute('minlength'),
                message: `Minimum length is ${field.getAttribute('minlength')} characters`
            });
        }

        if (field.hasAttribute('maxlength')) {
            fieldConfig.validators.push({
                type: 'maxLength',
                value: field.getAttribute('maxlength'),
                message: `Maximum length is ${field.getAttribute('maxlength')} characters`
            });
        }

        if (field.hasAttribute('pattern')) {
            fieldConfig.validators.push({
                type: 'pattern',
                value: field.getAttribute('pattern'),
                message: field.getAttribute('title') || 'Please match the required format'
            });
        }

        // Custom validation rules
        const customValidation = field.getAttribute('data-validation');
        if (customValidation) {
            try {
                const rules = JSON.parse(customValidation);
                rules.forEach(rule => {
                    fieldConfig.validators.push(rule);
                });
            } catch (e) {
                console.warn('Invalid custom validation rules:', customValidation);
            }
        }
    }

    validateField(formConfig, fieldConfig) {
        const field = fieldConfig.element;
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        // Run all validators
        for (const validator of fieldConfig.validators) {
            const validatorFn = this.validators.get(validator.type);
            
            if (validatorFn) {
                const result = validatorFn(value, validator.value);
                
                if (!result) {
                    isValid = false;
                    errorMessage = validator.message;
                    break;
                }
            }
        }

        // Update field state
        fieldConfig.isValid = isValid;
        fieldConfig.value = value;

        // Update UI
        this.updateFieldUI(fieldConfig, isValid, errorMessage);

        // Update form validity
        this.updateFormValidity(formConfig);

        return isValid;
    }

    updateFieldUI(fieldConfig, isValid, errorMessage) {
        const field = fieldConfig.element;
        const formGroup = field.closest('.form-group');
        const errorElement = fieldConfig.errorElement;

        if (formGroup) {
            if (isValid) {
                formGroup.classList.remove('error');
                formGroup.classList.add('valid');
            } else {
                formGroup.classList.remove('valid');
                formGroup.classList.add('error');
            }
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.opacity = errorMessage ? '1' : '0';
        }

        // Add visual feedback
        if (isValid && field.value) {
            field.style.borderColor = 'var(--success-color)';
        } else if (!isValid) {
            field.style.borderColor = 'var(--error-color)';
        } else {
            field.style.borderColor = '';
        }
    }

    updateFormValidity(formConfig) {
        let isFormValid = true;
        
        formConfig.fields.forEach(fieldConfig => {
            if (!fieldConfig.isValid && fieldConfig.element.hasAttribute('required')) {
                isFormValid = false;
            }
        });

        formConfig.isValid = isFormValid;

        // Update submit button state
        const submitButton = formConfig.element.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = !isFormValid;
            
            if (isFormValid) {
                submitButton.classList.remove('disabled');
            } else {
                submitButton.classList.add('disabled');
            }
        }
    }

    handleFormSubmission(formId) {
        const formConfig = this.forms.get(formId);
        
        if (!formConfig) return;

        // Validate all fields
        let isFormValid = true;
        formConfig.fields.forEach(fieldConfig => {
            if (!this.validateField(formConfig, fieldConfig)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.focusFirstError(formConfig);
            this.showFormError('Please correct the errors below');
            return;
        }

        // Get form data
        const formData = this.getFormData(formConfig);

        // Show loading state
        this.setFormLoading(formConfig, true);

        // Handle submission based on form type
        const formType = formConfig.element.getAttribute('data-form-type') || 'contact';
        this.submitForm(formType, formData, formConfig);
    }

    getFormData(formConfig) {
        const data = {};
        
        formConfig.fields.forEach((fieldConfig, fieldName) => {
            const field = fieldConfig.element;
            
            if (field.type === 'checkbox') {
                data[fieldName] = field.checked;
            } else if (field.type === 'radio') {
                if (field.checked) {
                    data[fieldName] = field.value;
                }
            } else {
                data[fieldName] = field.value;
            }
        });

        return data;
    }

    submitForm(formType, formData, formConfig) {
        // Simulate API submission
        const submissionPromise = this.simulateSubmission(formType, formData);

        submissionPromise
            .then((response) => {
                this.handleSubmissionSuccess(formConfig, response);
            })
            .catch((error) => {
                this.handleSubmissionError(formConfig, error);
            })
            .finally(() => {
                this.setFormLoading(formConfig, false);
            });
    }

    simulateSubmission(formType, formData) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            const delay = Math.random() * 2000 + 1000;
            
            setTimeout(() => {
                // Simulate success/failure (90% success rate)
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        message: this.getSuccessMessage(formType),
                        data: formData
                    });
                } else {
                    reject({
                        success: false,
                        message: 'Submission failed. Please try again.',
                        error: 'Network error'
                    });
                }
            }, delay);
        });
    }

    getSuccessMessage(formType) {
        const messages = {
            contact: 'Thank you for your message! We\'ll get back to you within 24 hours.',
            newsletter: 'Successfully subscribed to our newsletter!',
            investor: 'Your investor inquiry has been received. Our team will contact you soon.',
            partnership: 'Thank you for your partnership interest. We\'ll review your proposal.',
            career: 'Your application has been submitted successfully.',
            support: 'Your support request has been received. We\'ll assist you shortly.'
        };

        return messages[formType] || 'Form submitted successfully!';
    }

    handleSubmissionSuccess(formConfig, response) {
        // Show success notification
        this.showNotification(response.message, 'success');

        // Reset form
        this.resetForm(formConfig);

        // Trigger success animation
        this.animateFormSuccess(formConfig);
    }

    handleSubmissionError(formConfig, error) {
        // Show error notification
        this.showNotification(error.message, 'error');

        // Shake form for visual feedback
        this.animateFormError(formConfig);
    }

    setFormLoading(formConfig, isLoading) {
        const submitButton = formConfig.element.querySelector('button[type="submit"]');
        
        if (submitButton) {
            if (isLoading) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            } else {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }

        // Disable all form fields during submission
        formConfig.fields.forEach(fieldConfig => {
            fieldConfig.element.disabled = isLoading;
        });
    }

    resetForm(formConfig) {
        formConfig.element.reset();
        
        // Clear validation states
        formConfig.fields.forEach(fieldConfig => {
            const formGroup = fieldConfig.element.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error', 'valid');
            }
            
            if (fieldConfig.errorElement) {
                fieldConfig.errorElement.textContent = '';
                fieldConfig.errorElement.style.opacity = '0';
            }
            
            fieldConfig.element.style.borderColor = '';
            fieldConfig.isValid = false;
        });

        formConfig.isValid = false;
    }

    focusFirstError(formConfig) {
        const firstErrorField = Array.from(formConfig.fields.values())
            .find(fieldConfig => !fieldConfig.isValid);

        if (firstErrorField) {
            firstErrorField.element.focus();
            firstErrorField.element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    showFormError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icons[type]}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            padding: 1rem 1.5rem;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
            border-left: 4px solid var(--${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}-color);
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    animateFormSuccess(formConfig) {
        const form = formConfig.element;
        
        // Green flash effect
        form.style.background = 'rgba(16, 185, 129, 0.1)';
        form.style.transition = 'background 0.3s ease';
        
        setTimeout(() => {
            form.style.background = '';
        }, 1000);
    }

    animateFormError(formConfig) {
        const form = formConfig.element;
        
        // Shake animation
        form.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }

    setupGlobalFormHandlers() {
        // Auto-save functionality for long forms
        this.setupAutoSave();
        
        // Form analytics
        this.setupFormAnalytics();
        
        // Accessibility enhancements
        this.setupAccessibilityFeatures();
    }

    setupAutoSave() {
        const autoSaveForms = document.querySelectorAll('[data-auto-save]');
        
        autoSaveForms.forEach(form => {
            const formId = form.id;
            const saveKey = `form-autosave-${formId}`;
            
            // Load saved data
            this.loadAutoSavedData(form, saveKey);
            
            // Save on input
            form.addEventListener('input', () => {
                this.debounce(() => {
                    this.saveFormData(form, saveKey);
                }, 1000)();
            });
            
            // Clear on successful submission
            form.addEventListener('submit', () => {
                localStorage.removeItem(saveKey);
            });
        });
    }

    loadAutoSavedData(form, saveKey) {
        try {
            const savedData = localStorage.getItem(saveKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(fieldName => {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field && data[fieldName]) {
                        if (field.type === 'checkbox') {
                            field.checked = data[fieldName];
                        } else {
                            field.value = data[fieldName];
                        }
                    }
                });
                
                // Show auto-save indicator
                this.showAutoSaveIndicator(form);
            }
        } catch (e) {
            console.warn('Failed to load auto-saved data:', e);
        }
    }

    saveFormData(form, saveKey) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        try {
            localStorage.setItem(saveKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to auto-save form data:', e);
        }
    }

    showAutoSaveIndicator(form) {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = '<i class="fas fa-save"></i> Form data restored';
        indicator.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: var(--success-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.8rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        form.style.position = 'relative';
        form.appendChild(indicator);
        
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
        });
        
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }, 3000);
    }

    setupFormAnalytics() {
        // Track form interactions for UX improvements
        this.forms.forEach((formConfig, formId) => {
            const form = formConfig.element;
            
            // Track form start
            form.addEventListener('focusin', () => {
                this.trackEvent('form_start', { formId });
            }, { once: true });
            
            // Track field completion
            formConfig.fields.forEach((fieldConfig, fieldName) => {
                fieldConfig.element.addEventListener('blur', () => {
                    if (fieldConfig.isValid && fieldConfig.element.value) {
                        this.trackEvent('field_complete', { formId, fieldName });
                    }
                });
            });
            
            // Track form abandonment
            window.addEventListener('beforeunload', () => {
                const hasData = Array.from(formConfig.fields.values())
                    .some(fieldConfig => fieldConfig.element.value);
                
                if (hasData && !formConfig.submitted) {
                    this.trackEvent('form_abandon', { formId });
                }
            });
        });
    }

    trackEvent(eventName, data) {
        // Placeholder for analytics tracking
        console.log(`Analytics: ${eventName}`, data);
        
        // In a real implementation, you would send this to your analytics service
        // Example: gtag('event', eventName, data);
    }

    setupAccessibilityFeatures() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Screen reader announcements
        this.setupScreenReaderAnnouncements();
        
        // High contrast mode detection
        this.setupHighContrastMode();
    }

    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const focusedElement = document.activeElement;
        const focusedIndex = Array.from(focusableElements).indexOf(focusedElement);
        
        // Add visual focus indicators
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--primary-color)';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });
    }

    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);

        this.liveRegion = liveRegion;
    }

    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    setupHighContrastMode() {
        // Detect high contrast mode
        const testElement = document.createElement('div');
        testElement.style.cssText = `
            border: 1px solid;
            border-color: ButtonText;
            position: absolute;
            left: -9999px;
        `;
        document.body.appendChild(testElement);

        const isHighContrast = window.getComputedStyle(testElement).borderColor !== 'rgb(0, 0, 0)';
        document.body.removeChild(testElement);

        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    validateForm(formId) {
        const formConfig = this.forms.get(formId);
        if (!formConfig) return false;

        let isValid = true;
        formConfig.fields.forEach(fieldConfig => {
            if (!this.validateField(formConfig, fieldConfig)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getFormValues(formId) {
        const formConfig = this.forms.get(formId);
        if (!formConfig) return null;

        return this.getFormData(formConfig);
    }

    setFieldValue(formId, fieldName, value) {
        const formConfig = this.forms.get(formId);
        if (!formConfig) return;

        const fieldConfig = formConfig.fields.get(fieldName);
        if (fieldConfig) {
            fieldConfig.element.value = value;
            this.validateField(formConfig, fieldConfig);
        }
    }

    addCustomValidator(name, validatorFn) {
        this.validators.set(name, validatorFn);
    }
}

// Initialize form controller
document.addEventListener('DOMContentLoaded', () => {
    window.formController = new FormController();
});

// Export for use in other modules
window.FormController = FormController;