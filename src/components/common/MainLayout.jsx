import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header siempre arriba */}
      <Header />

      <main className="flex-grow-1">
        {children}
      </main>

      {/* Footer siempre abajo */}
      <footer className="text-center py-3 text-muted mt-auto bg-light border-top">
        <small>TECNOLÓGICO NACIONAL DE MÉXICO</small>
      </footer>
    </div>
  );
};

export default MainLayout;