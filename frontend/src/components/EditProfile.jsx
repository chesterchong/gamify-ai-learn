import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function EditProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    professionalRole: '',
    email: '',
    password: '',
    profilePhotoUrl: '',
  })

  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        setUser(data.user)
        
        // Initialize form data - keep inputs empty, show current values as placeholders
        const userType =
          data.user.professionalRole === 'admin' ? 'admin' : 'student'
        setFormData({
          fullName: '',
          username: '',
          professionalRole: userType,
          email: data.user.email || '',
          password: '',
          profilePhotoUrl: data.user.profilePhotoUrl || '',
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [apiBaseUrl])

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    setError('')

    try {
      // Upload photo via backend endpoint (handles Supabase storage authentication)
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`${apiBaseUrl}/api/auth/profile/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to upload photo')
      }

      const data = await response.json()
      if (!data.url) {
        throw new Error('Failed to get image URL')
      }

      setFormData((prev) => ({ ...prev, profilePhotoUrl: data.url }))
    } catch (err) {
      console.error('Photo upload error:', err)
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Only update fields that have been changed (non-empty)
      // If empty, preserve current values by not including them in the payload
      const updatePayload = {}

      if (formData.fullName.trim()) {
        updatePayload.fullName = formData.fullName.trim()
      }
      if (formData.username.trim()) {
        updatePayload.username = formData.username.trim()
      }
      updatePayload.professionalRole =
        formData.professionalRole === 'admin' ? 'admin' : 'student'
      if (formData.profilePhotoUrl) {
        updatePayload.profilePhotoUrl = formData.profilePhotoUrl
      }

      // Only include password if it's been changed (not empty)
      if (formData.password && formData.password.trim()) {
        updatePayload.password = formData.password.trim()
      }

      const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update profile')
      }

      const data = await response.json()
      setUser(data.user)
      setSuccess(true)
      
      // Clear password field after successful save
      setFormData((prev) => ({ ...prev, password: '' }))

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b111b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#0b111b] text-white">
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #2b3644;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3c4b5d;
        }
        input::placeholder {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Edit Profile
            </h1>
          </div>

          {(error || success) && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                error
                  ? 'bg-red-500/10 border-red-500/50 text-red-400'
                  : 'bg-green-500/10 border-green-500/50 text-green-400'
              }`}
            >
              {error || (success && 'Profile updated successfully! Redirecting...')}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <section className="rounded-2xl border border-[#1e2b3f] bg-[#0f1623] shadow-[0_20px_50px_-20px_rgba(15,31,52,0.9)] px-6 md:px-10 py-8 space-y-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="size-28 md:size-32 rounded-full border-4 border-[#21426a] bg-gradient-to-br from-[#0b111b] to-[#1b2738] flex items-center justify-center">
                      <div className="size-24 md:size-28 rounded-full overflow-hidden bg-[#0b111b] flex items-center justify-center">
                        {formData.profilePhotoUrl ? (
                          <img
                            alt="Profile preview"
                            className="h-full w-full object-cover opacity-90"
                            src={formData.profilePhotoUrl}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-slate-500">
                            account_circle
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={uploadingPhoto}
                    />
                    <button
                      className="absolute inset-0 m-auto size-16 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white flex flex-col items-center justify-center gap-1 hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[22px]">
                            photo_camera
                          </span>
                          <span className="text-[10px] font-semibold tracking-wide">
                            UPLOAD
                          </span>
                        </>
                      )}
                    </button>
                    {user && (
                      <span className="absolute -bottom-2 right-0 bg-[#f7c338] text-[#0b111b] text-xs font-bold px-3 py-1 rounded-full border border-[#0f1623]">
                        LVL {user.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      Full Name
                    </span>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder={user?.fullName || (user?.email ? user.email.split('@')[0] : 'Enter full name')}
                    />
                    <span className="text-[11px] text-slate-500">
                      Enter your full name
                    </span>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      Username
                    </span>
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder={user?.username || (user?.email ? user.email.split('@')[0] : 'Enter username')}
                    />
                    <span className="text-[11px] text-slate-500">
                      Choose a unique username
                    </span>
                  </label>
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      User Type
                    </span>
                    <select
                      name="professionalRole"
                      value={formData.professionalRole}
                      onChange={handleInputChange}
                      className="h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                    <span className="text-[11px] text-slate-500">
                      Account type: admin or student only
                    </span>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1f2d42] bg-[#0c131f] px-5 md:px-8 py-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-9 rounded-lg border border-[#214b3b] bg-[#10201a] text-[#4adf7a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">
                      code
                    </span>
                  </div>
                  <h2 className="text-lg font-bold">Account Settings</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      Email Address
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        name="email"
                        value={formData.email}
                        disabled
                        className="flex-1 h-11 rounded-lg bg-[#162235]/50 border border-[#23354d] px-4 text-sm text-white/70 cursor-not-allowed"
                        placeholder="you@example.com"
                      />
                      <button
                        className="h-11 px-4 rounded-lg border border-[#2a3d55] bg-[#0f1623] text-xs font-semibold text-slate-400 cursor-not-allowed"
                        type="button"
                        disabled
                        title="Email change not available"
                      >
                        Change Email
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Email cannot be changed
                    </span>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      Password
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="flex-1 h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
                        placeholder="Enter new password"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Leave empty to keep current password
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Link
                    className="inline-flex h-11 px-5 items-center justify-center rounded-lg border border-[#2a3d55] bg-transparent text-sm font-semibold text-slate-300 hover:bg-[#141f30] transition-colors"
                    to="/profile"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || uploadingPhoto}
                    className="h-11 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_right_alt
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
  )
}

export default EditProfile
