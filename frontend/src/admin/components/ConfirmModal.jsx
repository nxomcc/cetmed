export default function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-50' : 'bg-blue-50'}`}>
          <span className={`material-icons ${danger ? 'text-red-500' : 'text-[#003d7a]'}`}>
            {danger ? 'warning' : 'help'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#003d7a] hover:bg-[#002d5a]'}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
