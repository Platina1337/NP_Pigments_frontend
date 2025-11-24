import React from 'react'
import { Check } from 'lucide-react'

interface CheckoutStepsProps {
  currentStep: number
}

const steps = [
  { number: 1, title: 'Адрес доставки' },
  { number: 2, title: 'Способ доставки' },
  { number: 3, title: 'Оплата' },
]

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step.number < currentStep
                  ? 'bg-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-4 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

