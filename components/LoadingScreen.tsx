import BrandMark from '@/components/BrandMark';

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({ message = 'Cargando' }: LoadingScreenProps) {
  return (
    <div className="app-loading-screen" role="status" aria-live="polite">
      <div className="app-loading-glow app-loading-glow-a" />
      <div className="app-loading-glow app-loading-glow-b" />

      <div className="app-loading-content">
        <BrandMark />

        <h4 className="app-loading-title">Pareja Balance</h4>
        <p className="app-loading-message">
          {message}
          <span className="app-loading-dots" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </p>
        <div className="app-loading-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
