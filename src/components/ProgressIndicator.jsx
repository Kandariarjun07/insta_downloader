import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

const ProgressIndicator = ({ 
  steps = [], 
  currentStep = 0, 
  status = 'loading' // 'loading', 'success', 'error'
}) => {
  const getStepIcon = (stepIndex) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (stepIndex === currentStep) {
      if (status === 'error') {
        return <AlertCircle className="w-5 h-5 text-red-500" />
      } else if (status === 'success') {
        return <CheckCircle className="w-5 h-5 text-green-500" />
      } else {
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      }
    } else {
      return (
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
      )
    }
  }

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) {
      return 'completed'
    } else if (stepIndex === currentStep) {
      return status
    } else {
      return 'pending'
    }
  }

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return 'text-green-700 dark:text-green-300'
      case 'loading':
        return 'text-blue-700 dark:text-blue-300'
      case 'success':
        return 'text-green-700 dark:text-green-300'
      case 'error':
        return 'text-red-700 dark:text-red-300'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getConnectorColor = (stepIndex) => {
    if (stepIndex < currentStep) {
      return 'bg-green-500'
    } else if (stepIndex === currentStep && status === 'loading') {
      return 'bg-blue-500'
    } else {
      return 'bg-gray-300 dark:bg-gray-600'
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                {getStepIcon(index)}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${getStepColor(getStepStatus(index))}`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${getConnectorColor(index)}`}
                    style={{
                      width: index < currentStep ? '100%' : 
                             index === currentStep && status === 'loading' ? '50%' : '0%'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressIndicator
