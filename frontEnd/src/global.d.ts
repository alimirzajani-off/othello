declare global {
  interface Window {
    Eitaa?: {
      WebApp?: {
        initData: string;
        close: () => void;
        sendData: (data: string) => void;
      };
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Eitaa = window.Eitaa;
