export default function Topbar() {
  return (
    <div className="topbar py-2">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-4">
          <a href="tel:+56927781966" className="flex items-center gap-1">
            <span className="material-icons text-sm">phone</span>
            +56 9 2778 1966
          </a>
          <a href="mailto:contacto@cetmed.cl" className="flex items-center gap-1">
            <span className="material-icons text-sm">email</span>
            contacto@cetmed.cl
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="material-icons text-sm">location_on</span>
            Coquimbo, Chile
          </span>
          <span className="opacity-40">|</span>
          <span className="bg-[var(--accent)] text-[var(--primary-dark)] font-bold px-2 py-0.5 rounded text-[0.7rem]">
            OTEC SENCE
          </span>
          <span className="opacity-40">|</span>
          <a href="https://cursos.cetmed.cl/login/index.php" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-white/90 hover:text-white transition-colors">
            <span className="material-icons text-sm">computer</span>
            Aula Virtual
          </a>
        </div>
      </div>
    </div>
  )
}
