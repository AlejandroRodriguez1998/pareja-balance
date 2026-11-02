type SectionLoaderProps = {
  label?: string;
};

// Esqueleto ligero para cuando se navega entre secciones.
// La pantalla con el logo animado (LoadingScreen) queda reservada para el arranque.
export default function SectionLoader({ label = 'Cargando' }: SectionLoaderProps) {
  return (
    <div className="section-loader" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className="section-loader-container" aria-hidden="true">
        <div className="section-loader-top">
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-circle" />
        </div>

        <div className="section-loader-hero">
          <span className="skeleton skeleton-line skeleton-w-30" />
          <span className="skeleton skeleton-value" />
          <span className="skeleton skeleton-bar" />
        </div>

        <div className="section-loader-grid">
          <span className="skeleton skeleton-card" />
          <span className="skeleton skeleton-card" />
        </div>

        <div className="section-loader-list">
          {[0, 1, 2, 3].map((i) => (
            <div className="section-loader-row" key={i} style={{ animationDelay: `${i * 70}ms` }}>
              <span className="skeleton skeleton-avatar" />
              <div className="section-loader-row-text">
                <span className="skeleton skeleton-line skeleton-w-60" />
                <span className="skeleton skeleton-line skeleton-w-35" />
              </div>
              <span className="skeleton skeleton-line skeleton-w-15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
