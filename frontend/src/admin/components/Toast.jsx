export default function Toast({ toasts, remove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in ${
            t.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          <span className="material-icons text-[18px] shrink-0">
            {t.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 shrink-0">
            <span className="material-icons text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
