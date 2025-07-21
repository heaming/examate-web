import toast, { Toaster, resolveValue } from 'react-hot-toast';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// 커스텀 토스트 컴포넌트
export const CustomToaster = () => {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 2000,
                style: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                    margin: 0,
                },
            }}
        >
            {(t) => (
                <div
                    className={`
            flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg
            bg-card border border-border text-card-foreground
            transform transition-all duration-300 ease-in-out
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-0 scale-95'}
            max-w-sm mx-auto
          `}
                >
                    {/* 아이콘 */}
                    <div className="flex-shrink-0">
                        {t.type === 'success' && (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                        )}
                        {t.type === 'error' && (
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <X className="w-4 h-4 text-red-600" />
                            </div>
                        )}
                        {t.type === 'loading' && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {!t.type && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Info className="w-4 h-4 text-blue-600" />
                            </div>
                        )}
                    </div>

                    {/* 메시지 */}
                    <div className="flex-1 text-sm font-medium">
                        {resolveValue(t.message, t)}
                    </div>

                    {/* 닫기 버튼 */}
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            )}
        </Toaster>
    );
};

export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    info: (message: string) => toast(message),
    promise: <T,>(
        promise: Promise<T>,
        msgs: {
            loading: string;
            success: string;
            error: string;
        }
    ) => toast.promise(promise, msgs),
};