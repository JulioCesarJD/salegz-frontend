export function AccessDenied({
  title = 'Acceso Denegado',
  message = 'No tienes permisos para acceder a esta sección.',
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h2
          style={{ color: 'var(--text-primary)' }}
          className="text-xl sm:text-2xl font-bold mb-2"
        >
          {title}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>{message}</p>
      </div>
    </div>
  )
}
