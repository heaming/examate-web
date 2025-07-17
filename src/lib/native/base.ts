export abstract class NativeAPIBase {
    private messageId = 0;
    private pendingRequests = new Map<string, { resolve: Function, reject: Function }>();
    private messageListener: ((event: MessageEvent) => void) | null = null;

    constructor() {
        if (typeof window !== 'undefined' && !this.messageListener) {
            this.messageListener = this.handleMessage.bind(this);
            window.addEventListener('message', this.messageListener);
        }
    }

    private handleMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data);
            const request = this.pendingRequests.get(message.id);

            if (request) {
                this.pendingRequests.delete(message.id);
                if (message.error) {
                    request.reject(new Error(message.error));
                } else {
                    request.resolve(message.data);
                }
            }
        } catch (error) {
            console.error('Native 메시지 파싱 실패:', error);
        }
    }

    protected sendMessage<T>(type: string, data?: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const id = (++this.messageId).toString();

            this.pendingRequests.set(id, { resolve, reject });

            // 3초 타임아웃 처리
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('네이티브 응답 타임아웃'));
                }
            }, 3000);

            if (typeof window !== 'undefined' && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type, data, id }));
            } else {
                // 웹 환경에서는 즉시 에러 반환
                setTimeout(() => {
                    if (this.pendingRequests.has(id)) {
                        this.pendingRequests.delete(id);
                        reject(new Error('React Native WebView 없음'));
                    }
                }, 100);
            }
        });
    }

    destroy() {
        if (this.messageListener && typeof window !== 'undefined') {
            window.removeEventListener('message', this.messageListener);
            this.messageListener = null;
        }
        this.pendingRequests.clear();
    }
}

declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }
}