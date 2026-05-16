import { useState } from 'react';

function OnboardingGuide({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to RepoSense! 👋',
      description: 'Your AI-powered codebase intelligence tool',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            RepoSense helps you understand and navigate codebases with ease using AI-powered analysis.
          </p>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Key Features:</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">🔍</span>
                <span>Deep code analysis and architecture mapping</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🗺️</span>
                <span>Interactive visualizations of code structure</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💬</span>
                <span>AI assistant to answer questions about your code</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Comprehensive statistics and metrics</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Architecture Map 🗺️',
      description: 'Visualize your codebase structure',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            The Architecture Map provides an interactive tree visualization of your repository structure.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">How to use:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• <strong>Scroll</strong> to zoom in/out</li>
                <li>• <strong>Drag</strong> to pan around the map</li>
                <li>• <strong>Hover</strong> over nodes to see details</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Node Colors:</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">Directories</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Files</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-300">Modules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Activity Heatmap 🔥',
      description: 'Identify code hotspots',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            The Activity Heatmap shows which files are most actively developed based on commits and complexity.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">What it shows:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Top 20 most active files</li>
                <li>• Activity score based on commits and changes</li>
                <li>• Color intensity indicates activity level</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Use cases:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Find frequently modified files</li>
                <li>• Identify potential refactoring candidates</li>
                <li>• Understand development focus areas</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Chat Assistant 💬',
      description: 'Ask questions about your codebase',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Chat with our AI assistant to get instant answers about your repository.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">Example questions:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• "What does the main.py file do?"</li>
                <li>• "How is authentication implemented?"</li>
                <li>• "What are the main components?"</li>
                <li>• "Explain the database schema"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Tips:</h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Be specific in your questions</li>
                <li>• Ask about specific files or features</li>
                <li>• Request code explanations or documentation</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ready to Explore! 🚀',
      description: 'Start analyzing your repositories',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            You're all set! Here are some tips to get the most out of RepoSense:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-2">Best Practices:</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Start with the Architecture Map to understand overall structure</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Use the Heatmap to identify important files</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Ask the AI assistant specific questions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Check the statistics bar for quick insights</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 <strong>Pro Tip:</strong> You can reopen this guide anytime by clicking the "Help" button in the header.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400">{steps[currentStep].description}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingGuide;

// Made with Bob
