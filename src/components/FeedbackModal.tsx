'use client'

import { useState, useEffect } from 'react'
import { mcp_playwright_browser_navigate, mcp_playwright_browser_click, mcp_playwright_browser_type, mcp_playwright_browser_wait_for } from '@/lib/mcp-tools'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackType = 'bug' | 'feature' | 'general' | 'improvement'

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackTypes = [
    { id: 'bug' as FeedbackType, label: '🐛 Сообщить об ошибке', emoji: '🐛', description: 'Нашли баг или проблему?' },
    { id: 'feature' as FeedbackType, label: '💡 Предложить функцию', emoji: '💡', description: 'Есть идея для новой функции?' },
    { id: 'improvement' as FeedbackType, label: '✨ Предложить улучшение', emoji: '✨', description: 'Как сделать сайт лучше?' },
    { id: 'general' as FeedbackType, label: '💬 Общее мнение', emoji: '💬', description: 'Просто хотите поделиться мыслями?' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Open feedback form in new tab using MCP
      await mcp_playwright_browser_navigate({
        url: 'https://forms.gle/your-feedback-form-id' // Replace with actual form URL
      })

      // Wait for form to load
      await mcp_playwright_browser_wait_for({ time: 2 })

      // Fill out the form fields (adjust selectors based on actual form)
      if (title) {
        await mcp_playwright_browser_type({
          element: 'Title input field',
          ref: '[name="title"]', // Adjust selector
          text: title
        })
      }

      if (description) {
        await mcp_playwright_browser_type({
          element: 'Description textarea',
          ref: '[name="description"]', // Adjust selector
          text: description
        })
      }

      if (email) {
        await mcp_playwright_browser_type({
          element: 'Email input field',
          ref: '[name="email"]', // Adjust selector
          text: email
        })
      }

      // Submit the form
      await mcp_playwright_browser_click({
        element: 'Submit button',
        ref: '[type="submit"]' // Adjust selector
      })

      setIsSubmitted(true)
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        // Reset form
        setTitle('')
        setDescription('')
        setEmail('')
        setFeedbackType('general')
      }, 2000)

    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Fallback: show message to user
      alert('Форма обратной связи открыта в новой вкладке. Пожалуйста, заполните её вручную.')
      setIsSubmitting(false)
    }
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform animate-bounce-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-lavender-600 via-mint-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="text-xl font-bold">Обратная связь</h3>
                <p className="text-purple-100">Помогите нам стать лучше!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">Спасибо за отзыв!</h4>
              <p className="text-foreground/60">Ваша обратная связь очень важна для нас.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Тип обратной связи
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        feedbackType === type.id
                          ? 'border-lavender-500 bg-lavender-50 shadow-lg'
                          : 'border-gray-200 hover:border-lavender-300 hover:bg-lavender-25'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{type.emoji}</span>
                        <div>
                          <div className={`font-medium ${feedbackType === type.id ? 'text-lavender-700' : 'text-foreground'}`}>
                            {type.label}
                          </div>
                          <div className="text-sm text-foreground/60 mt-1">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Краткое описание <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Опишите проблему или идею в двух словах"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Подробное описание <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите подробнее о вашей идее или проблеме..."
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email для связи <span className="text-foreground/60">(необязательно)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Отправка...</span>
                    </div>
                  ) : (
                    'Отправить отзыв'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


