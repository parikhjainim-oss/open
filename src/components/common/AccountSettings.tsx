import { useState } from 'react';
import { Camera, KeyRound, Save, UserRound } from 'lucide-react';
import type { AuthUser } from '../../services/api';
import { authApi } from '../../services/api';

export function AccountSettings({ account, onUpdate }: { account: AuthUser; onUpdate: (user: AuthUser) => void }) {
  const profile = account.role === 'driver' ? account.driver : account.rider;
  const [name, setName] = useState(profile?.name || account.name || '');
  const [phone, setPhone] = useState(profile?.phone || account.phone || '');
  const [photo, setPhoto] = useState(account.photo || '');
  const [gender, setGender] = useState(account.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(account.dateOfBirth || '');
  const [emergencyContact, setEmergencyContact] = useState(account.emergencyContact || '');
  const [homeAddress, setHomeAddress] = useState(account.homeAddress || '');
  const [vehicleType, setVehicleType] = useState(account.driver?.vehicleType || 'bike');
  const [vehicleNumber, setVehicleNumber] = useState(account.driver?.vehicleNumber || '');
  const [licenceNumber, setLicenceNumber] = useState(account.driver?.licenceNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const saveProfile = () => {
    const next = { ...account, photo, gender, dateOfBirth, emergencyContact, homeAddress };
    if (next.role === 'driver' && next.driver) next.driver = { ...next.driver, name: name.trim(), phone: phone.trim(), vehicleType, vehicleNumber: vehicleNumber.trim(), licenceNumber: licenceNumber.trim() };
    else if (next.role === 'rider' && next.rider) next.rider = { ...next.rider, name: name.trim(), phone: phone.trim() };
    else { next.name = name.trim(); next.phone = phone.trim(); }
    authApi.updateLocalProfile(next);
    onUpdate(next);
    setNotice('Profile saved.'); setError('');
  };

  const savePassword = async () => {
    setError(''); setNotice('');
    try {
      await authApi.changePassword(account.id, currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setNotice('Password changed. Use the new password next time you sign in.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update password.'); }
  };

  return <div className="space-y-4">
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3"><div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-[#A04100]">{photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <UserRound size={28} />}<label className="absolute inset-0 flex cursor-pointer items-end justify-center bg-black/35 pb-1 text-white" title="Upload profile photo"><Camera size={15} /><input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 1500000) { setError('Choose a photo smaller than 1.5 MB.'); return; } const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); }} /></label></div><div><h2 className="font-bold text-gray-900">Profile information</h2><p className="text-xs text-gray-500">Update the details shown on your account</p></div></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-gray-600">Full name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
        <label className="text-xs font-semibold text-gray-600">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
        <label className="text-xs font-semibold text-gray-600">Gender<select value={gender} onChange={(event) => setGender(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm"><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option></select></label>
        <label className="text-xs font-semibold text-gray-600">Date of birth<input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
        {account.role === 'driver' && <><label className="text-xs font-semibold text-gray-600">Vehicle type<select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm"><option value="bike">Bike</option><option value="auto">Auto</option><option value="cab">Cab</option></select></label><label className="text-xs font-semibold text-gray-600">Vehicle registration<input value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label><label className="text-xs font-semibold text-gray-600 sm:col-span-2">Driving licence number<input value={licenceNumber} onChange={(event) => setLicenceNumber(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label></>}
        <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Emergency contact<input value={emergencyContact} onChange={(event) => setEmergencyContact(event.target.value)} placeholder="Name and phone number" className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
        <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Home address<input value={homeAddress} onChange={(event) => setHomeAddress(event.target.value)} placeholder="Your saved home address" className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
      </div>
      <p className="mt-3 text-xs text-gray-500">Email: {account.email} · This email is your sign-in ID and cannot be edited here.</p>
      <button type="button" onClick={saveProfile} className="mt-4 flex items-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-2.5 text-sm font-bold text-white"><Save size={16} />Save profile</button>
    </section>
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><KeyRound size={18} className="text-[#A04100]" /><h2 className="font-bold text-gray-900">Change password</h2></div>
      <label className="block text-xs font-semibold text-gray-600">Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" autoComplete="current-password" /></label>
      <label className="block text-xs font-semibold text-gray-600">New password<input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" autoComplete="new-password" /></label>
      <button type="button" onClick={() => void savePassword()} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-700">Update password</button>
    </section>
    {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>;
}
