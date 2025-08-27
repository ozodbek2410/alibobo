import React, { useState, useEffect } from 'react';

// AdminNotificationModals - exact match with index.html modal system
const AdminNotificationModals = ({
  alertModal,
  confirmModal,
  promptModal,
  closeAlert,
  onConfirmResponse,
  onPromptResponse
}) => {
  const [promptValue, setPromptValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  // Reset values when modals open
  useEffect(() => {
    if (promptModal?.show) {
      setPromptValue(promptModal.defaultValue || '');
    }
  }, [promptModal?.show]);

  useEffect(() => {
    if (confirmModal?.show && confirmModal.type === 'select') {
      setSelectValue('');
    }
  }, [confirmModal?.show]);

  // Handle keyboard events - matching index.html behavior exactly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (alertModal?.show) closeAlert?.();
        if (confirmModal?.show) onConfirmResponse?.(false);
        if (promptModal?.show) onPromptResponse?.(null);
      }
      if (e.key === 'Enter') {
        if (promptModal?.show) {
          onPromptResponse?.(promptValue);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [alertModal?.show, confirmModal?.show, promptModal?.show, promptValue, closeAlert, onConfirmResponse, onPromptResponse]);

  // Icon configurations matching index.html
  const getIconConfig = (type) => {
    const iconConfigs = {
      info: { icon: 'fas fa-info-circle', color: 'bg-blue-100 text-blue-600' },
      success: { icon: 'fas fa-check-circle', color: 'bg-green-100 text-green-600' },
      warning: { icon: 'fas fa-exclamation-triangle', color: 'bg-yellow-100 text-yellow-600' },
      error: { icon: 'fas fa-times-circle', color: 'bg-red-100 text-red-600' },
      danger: { icon: 'fas fa-trash', color: 'bg-red-100 text-red-600' },
      question: { icon: 'fas fa-question-circle', color: 'bg-blue-100 text-blue-600' },
      edit: { icon: 'fas fa-edit', color: 'bg-blue-100 text-blue-600' }
    };
    return iconConfigs[type] || iconConfigs.info;
  };

  return (
    <>
      {/* Custom CSS Animations - matching index.html exactly */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounceNotification {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounceNotification 2s;
        }
        
        .modal-backdrop {
          backdrop-filter: blur(4px);
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
      
      {/* Alert Modal */}
      {alertModal?.show && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 animate-slideIn">
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${getIconConfig(alertModal.type).color}`}>
                  <i className={`${getIconConfig(alertModal.type).icon} text-2xl`}></i>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {alertModal.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {alertModal.message}
              </p>
              
              <button
                onClick={closeAlert}
                className="w-full px-4 py-2.5 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-opacity-50"
                autoFocus
              >
                Yaxshi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 animate-slideIn">
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${getIconConfig(confirmModal.type).color}`}>
                  <i className={`${getIconConfig(confirmModal.type).icon} text-2xl`}></i>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmModal.message}
              </p>

              {/* Select field for order status updates */}
              {confirmModal.type === 'select' && (
                <div className="mb-4">
                  <select
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                    autoFocus
                  >
                    <option value="">Tanlang</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="processing">Jarayonda</option>
                    <option value="completed">Yakunlangan</option>
                    <option value="cancelled">Bekor qilingan</option>
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    onConfirmResponse?.(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                >
                  {confirmModal.type === 'danger' ? 'Bekor qilish' : 'Yo\'q'}
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.type === 'select') {
                      onConfirmResponse?.(selectValue);
                    } else {
                      // Call the callback function if it exists
                      if (confirmModal.callback) {
                        confirmModal.callback();
                      }
                      onConfirmResponse?.(true);
                    }
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    confirmModal.type === 'danger'
                      ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                      : 'bg-primary-orange text-white hover:bg-opacity-90 focus:ring-primary-orange'
                  }`}
                  autoFocus={confirmModal.type !== 'select'}
                >
                  {confirmModal.type === 'danger' ? 'O\'chirish' : confirmModal.type === 'select' ? 'Yangilash' : 'Ha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptModal?.show && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 animate-slideIn">
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${getIconConfig('question').color}`}>
                  <i className={`${getIconConfig('question').icon} text-2xl`}></i>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {promptModal.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {promptModal.message}
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  placeholder={promptModal.placeholder || 'Javobni kiriting...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onPromptResponse?.(promptValue);
                    } else if (e.key === 'Escape') {
                      onPromptResponse?.(null);
                    }
                  }}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => onPromptResponse?.(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => onPromptResponse?.(promptValue)}
                  className="flex-1 px-4 py-2.5 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-opacity-50"
                >
                  Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        /* Notification new animation */
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .notification-new {
          animation: slideInFromTop 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default AdminNotificationModals;
