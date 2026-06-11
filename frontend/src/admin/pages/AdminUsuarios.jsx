import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../services/adminApi'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const ROLE_LABEL = { 'admin-api': 'Administrador', editor: 'Editor', authenticated: 'Usuario', public: 'Público' }
const ROLE_COLOR = { 'admin-api': 'bg-purple-100 text-purple-700', editor: 'bg-blue-100 text-blue-700', authenticated: 'bg-gray-100 text-gray-600', public: 'bg-gray-100 text-gray-400' }

const BLANK_FORM = { username: '', email: '', password: '', role: '', blocked: false }

export default function AdminUsuarios() {
  const { user: me, isAdmin } = useAdminAuth()
  const { toasts, toast, remove } = useToast()

  const [users, setUsers]       = useState([])
  const [roles, setRoles]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)   // null | 'create' | 'edit'
  const [form, setForm]         = useState(BLANK_FORM)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(async () => {
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()])
      setUsers(usersData)
      const filtered = (rolesData.roles || []).filter(r => ['admin-api', 'editor', 'authenticated'].includes(r.type))
      setRoles(filtered)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setForm({ ...BLANK_FORM, role: 'editor' })
    setFormErr('')
    setModal('create')
  }

  function openEdit(u) {
    setForm({ username: u.username, email: u.email, password: '', role: u.role?.type || 'editor', blocked: !!u.blocked })
    setFormErr('')
    setModal({ type: 'edit', id: u.id })
  }

  async function handleSave() {
    setFormErr('')
    if (!form.username.trim() || !form.email.trim()) { setFormErr('Usuario y email son requeridos.'); return }
    if (modal === 'create' && !form.password) { setFormErr('La contraseña es requerida.'); return }

    setSaving(true)
    try {
      if (modal === 'create') {
        await createUser({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role || 'editor',
          blocked: form.blocked,
        })
        toast('Usuario creado', 'success')
      } else {
        const payload = { username: form.username.trim(), email: form.email.trim(), role: form.role, blocked: form.blocked }
        if (form.password) payload.password = form.password
        await updateUser(modal.id, payload)
        toast('Usuario actualizado', 'success')
      }
      setModal(null)
      load()
    } catch (e) {
      setFormErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDel) return
    try {
      await deleteUser(confirmDel.id)
      toast('Usuario eliminado', 'success')
      setConfirmDel(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
      setConfirmDel(null)
    }
  }

  async function toggleBlocked(u) {
    try {
      await updateUser(u.id, { blocked: !u.blocked })
      toast(u.blocked ? 'Usuario desbloqueado' : 'Usuario bloqueado', 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const isOpen = modal !== null
  const isEditMode = modal && typeof modal === 'object'

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} remove={remove} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de acceso al panel</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#003d7a] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#002d5a] transition-colors">
            <span className="material-icons text-[18px]">person_add</span>
            Nuevo usuario
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuario o email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-icons text-4xl mb-2 block">group_off</span>
            No se encontraron usuarios
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrado</th>
                  {isAdmin && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => {
                  const isSelf = u.id === me?.id
                  const roleType = u.role?.type
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#003d7a] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {u.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-gray-900">{u.username}</span>
                          {isSelf && <span className="text-xs bg-[#F0A500]/20 text-[#b87800] px-1.5 py-0.5 rounded-md font-medium">Tú</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLOR[roleType] || 'bg-gray-100 text-gray-500'}`}>
                          {ROLE_LABEL[roleType] || roleType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.blocked
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Bloqueado</span>
                          : <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Activo</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50 transition-colors"
                              title="Editar"
                            >
                              <span className="material-icons text-[16px]">edit</span>
                            </button>
                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => toggleBlocked(u)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                  title={u.blocked ? 'Desbloquear' : 'Bloquear'}
                                >
                                  <span className="material-icons text-[16px]">{u.blocked ? 'lock_open' : 'block'}</span>
                                </button>
                                <button
                                  onClick={() => setConfirmDel(u)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar"
                                >
                                  <span className="material-icons text-[16px]">delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isEditMode ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <span className="material-icons text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <span className="material-icons text-[16px]">error</span>
                  {formErr}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuario</label>
                <input
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="nombre.apellido"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@cetmed.cl"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contraseña {isEditMode && <span className="font-normal text-gray-400">(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder={isEditMode ? '••••••••' : 'Mínimo 8 caracteres'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10 bg-white"
                >
                  {roles.map(r => (
                    <option key={r.type} value={r.type}>{ROLE_LABEL[r.type] || r.name}</option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(p => ({ ...p, blocked: !p.blocked }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.blocked ? 'bg-red-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.blocked ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Cuenta bloqueada</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#003d7a] text-white text-sm font-semibold rounded-xl hover:bg-[#002d5a] transition-colors disabled:opacity-60"
              >
                {saving && <span className="animate-spin material-icons text-[16px]">refresh</span>}
                {isEditMode ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDel}
        title="¿Eliminar usuario?"
        message={`Se eliminará permanentemente la cuenta de "${confirmDel?.username}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}
