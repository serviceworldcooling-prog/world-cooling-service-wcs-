'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Settings, User, Bell, Shield, Palette, Globe,
  Mail, Phone, MapPin, Save, Camera,
  ToggleLeft, ToggleRight, ChevronRight, Key,
  CreditCard, Building, Clock, Zap
} from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { key: 'profile',       label: 'Profile',       icon: User },
  { key: 'notifications', label: 'Notifications',  icon: Bell },
  { key: 'security',      label: 'Security',       icon: Shield },
  { key: 'appearance',    label: 'Appearance',     icon: Palette },
  { key: 'business',      label: 'Business',       icon: Building },
  { key: 'integrations',  label: 'Integrations',   icon: Zap },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout title="System Settings" subtitle="Manage your admin account preferences, business parameters, and API integrations">
      
      {/* ── Main Layout (Flex Col on Mobile, Flex Row on Desktop) ── */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-5">

        {/* ── Desktop Sidebar Tabs / Mobile Horizontal Scroll Tabs ── */}
        <div className="w-full md:w-56 shrink-0">
          
          {/* Mobile Horizontal Scrollable Tab Pills */}
          <div className="flex md:hidden overflow-x-auto gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 mb-2 no-scrollbar">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx(
                  'flex items-center gap-2 px-3.5 py-2 text-xs font-700 rounded-xl whitespace-nowrap transition-all',
                  activeTab === key
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Desktop Vertical Sidebar Cards */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3.5 text-xs font-700 transition-all duration-150 border-b border-slate-100 last:border-0',
                  activeTab === key
                    ? 'bg-teal-50 text-teal-800 border-l-4 border-l-teal-700 pl-3.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon size={16} className={activeTab === key ? 'text-teal-700' : 'text-slate-400'} />
                {label}
                {activeTab === key && <ChevronRight size={14} className="ml-auto text-teal-700" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content Panel (Touched Left & Right on Mobile) ── */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-800 text-slate-900">Profile Information</h2>
                <p className="text-xs text-slate-400 mt-0.5">Update your personal and contact details</p>
              </div>
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 flex items-center justify-center text-white text-xl sm:text-2xl font-800 shadow-sm">
                      SA
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center shadow-sm hover:bg-teal-50 transition-all">
                      <Camera size={12} className="text-slate-600" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-800 text-slate-900">Super Admin</p>
                    <p className="text-xs text-slate-400">admin@acservice.com</p>
                    <button className="text-xs text-teal-700 font-700 mt-1 hover:underline">Change Photo</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {[
                    { label: 'First Name',    value: 'Super',          icon: User },
                    { label: 'Last Name',     value: 'Admin',          icon: User },
                    { label: 'Email Address', value: 'admin@acservice.com', icon: Mail },
                    { label: 'Phone Number',  value: '+91 98765-43210', icon: Phone },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input type="text" defaultValue={value} className="input-field pl-9 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Office Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                    <textarea rows={2} defaultValue="Suite 500, World Cooling Service HQ, Sector 62, Noida, UP 201301" className="input-field pl-9 text-xs resize-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Bio / About</label>
                  <textarea rows={3} defaultValue="Administrator of AC Service platform, managing all operations, bookings, technician dispatch, and customer relations." className="input-field text-xs resize-none" />
                </div>

                <button onClick={handleSave} className={clsx('btn-primary py-2.5 px-6 text-xs font-700 rounded-xl w-full sm:w-auto justify-center', saved && 'bg-emerald-600 hover:bg-emerald-700')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-800 text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control which alerts and updates you receive</p>
              </div>
              <div className="p-4 sm:p-6 space-y-1">
                {[
                  { label: 'New Booking Alert',         desc: 'Notify when a new booking is created', enabled: true },
                  { label: 'Booking Cancellation',       desc: 'Notify when a customer cancels',       enabled: true },
                  { label: 'Technician Status Change',   desc: 'When a technician goes on/off duty',   enabled: false },
                  { label: 'New Customer Registration',  desc: 'When a new user signs up',             enabled: true },
                  { label: 'Payment Received',           desc: 'When a payment is processed',          enabled: true },
                  { label: 'Refund Requested',           desc: 'When a customer requests a refund',    enabled: true },
                  { label: 'New Review Posted',          desc: 'When a customer leaves a review',      enabled: false },
                  { label: 'Low Wallet Balance Alert',   desc: 'When a customer wallet goes below ₹500', enabled: false },
                  { label: 'Emergency Booking',          desc: 'Alert for emergency service requests', enabled: true },
                  { label: 'System Maintenance Alerts',  desc: 'Platform-level alerts and warnings',   enabled: true },
                ].map(({ label, desc, enabled }) => (
                  <div key={label} className="flex items-center justify-between py-3.5 sm:py-4 border-b border-slate-100 last:border-0 gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-700 text-slate-800">{label}</p>
                      <p className="text-[11px] text-slate-400">{desc}</p>
                    </div>
                    <button className="ml-2 shrink-0">
                      {enabled
                        ? <ToggleRight size={28} className="text-teal-700" />
                        : <ToggleLeft size={28} className="text-slate-300" />
                      }
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-4 sm:px-6 py-4 border-t border-slate-100">
                <button onClick={handleSave} className={clsx('btn-primary py-2.5 px-6 text-xs font-700 rounded-xl w-full sm:w-auto justify-center', saved && 'bg-emerald-600')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                  <h2 className="text-sm sm:text-base font-800 text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Use a strong password to keep your account secure</p>
                </div>
                <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                  {[
                    { label: 'Current Password',  placeholder: '••••••••' },
                    { label: 'New Password',       placeholder: 'Min. 8 characters' },
                    { label: 'Confirm Password',   placeholder: 'Repeat new password' },
                  ].map(({ label, placeholder }) => (
                    <div key={label}>
                      <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <div className="relative">
                        <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" placeholder={placeholder} className="input-field pl-9 text-xs" />
                      </div>
                    </div>
                  ))}
                  <button className="btn-primary py-2.5 px-6 text-xs font-700 rounded-xl w-full sm:w-auto justify-center">
                    <Shield size={15} /> Update Password
                  </button>
                </div>
              </div>

              <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                  <h2 className="text-sm sm:text-base font-800 text-slate-900">Two-Factor Authentication</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-800 text-slate-800">Authenticator App</p>
                      <p className="text-xs text-slate-400">Use Google Authenticator or Microsoft Authenticator</p>
                    </div>
                    <button className="btn-secondary text-xs font-700 px-4 py-2 rounded-xl w-full sm:w-auto justify-center">Enable 2FA</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-800 text-slate-900">Appearance Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize the visual design system of your workspace</p>
              </div>
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Theme */}
                <div>
                  <p className="text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-2.5">Theme Mode</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'light',  label: 'Light',  preview: 'bg-white border-2 border-teal-600' },
                      { key: 'dark',   label: 'Dark',   preview: 'bg-slate-900' },
                      { key: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-slate-900' },
                    ].map(({ key, label, preview }) => (
                      <button key={key} className={clsx('p-3 rounded-xl border-2 transition-all', key === 'light' ? 'border-teal-700 bg-teal-50/20' : 'border-slate-200 hover:border-slate-300')}>
                        <div className={`h-12 rounded-lg mb-2 ${preview}`} />
                        <p className={clsx('text-xs font-700', key === 'light' ? 'text-teal-800' : 'text-slate-500')}>{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <p className="text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-2.5">Accent Color Palette</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { color: '#0F766E', label: 'Teal (Default)' },
                      { color: '#7C3AED', label: 'Purple' },
                      { color: '#2563EB', label: 'Blue' },
                      { color: '#DC2626', label: 'Red' },
                      { color: '#D97706', label: 'Amber' },
                      { color: '#059669', label: 'Green' },
                    ].map(({ color, label }) => (
                      <button key={color} title={label} className={clsx('w-9 h-9 rounded-full border-2 transition-all hover:scale-110', color === '#0F766E' ? 'border-slate-800 scale-110' : 'border-transparent')} style={{ background: color }} />
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Language</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select className="input-field pl-9 text-xs">
                      <option>English (IN)</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSave} className={clsx('btn-primary py-2.5 px-6 text-xs font-700 rounded-xl w-full sm:w-auto justify-center', saved && 'bg-emerald-600')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Appearance'}
                </button>
              </div>
            </div>
          )}

          {/* ── Business ── */}
          {activeTab === 'business' && (
            <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-800 text-slate-900">Business Operating Parameters</h2>
                <p className="text-xs text-slate-400 mt-0.5">Configure your business details, GST tax rates, and operating hours</p>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {[
                    { label: 'Business Name',  value: 'World Cooling Service Pro', icon: Building },
                    { label: 'Support Email',  value: 'support@worldcoolingservice.com', icon: Mail },
                    { label: 'Support Phone',  value: '+91 1800-COOLING', icon: Phone },
                    { label: 'GST Tax Rate (%)', value: '18.0', icon: CreditCard },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" defaultValue={value} className="input-field pl-9 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Business Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea rows={2} defaultValue="Suite 500, World Cooling Service HQ, Sector 62, Noida, UP 201301" className="input-field pl-9 text-xs resize-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Opening Time</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="time" defaultValue="08:00" className="input-field pl-9 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Closing Time</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="time" defaultValue="22:00" className="input-field pl-9 text-xs" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  {[
                    { label: 'Accept Emergency Bookings',   enabled: true },
                    { label: 'Enable Customer Reviews',     enabled: true },
                    { label: 'Auto-assign Technicians',     enabled: false },
                    { label: 'Enable Wallet Payments',      enabled: true },
                    { label: 'Show Technician Live Tracking', enabled: true },
                  ].map(({ label, enabled }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
                      <p className="text-xs sm:text-sm font-600 text-slate-700">{label}</p>
                      <button className="shrink-0">
                        {enabled
                          ? <ToggleRight size={26} className="text-teal-700" />
                          : <ToggleLeft size={26} className="text-slate-300" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSave} className={clsx('btn-primary py-2.5 px-6 text-xs font-700 rounded-xl w-full sm:w-auto justify-center', saved && 'bg-emerald-600')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Business Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {activeTab === 'integrations' && (
            <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-800 text-slate-900">API Integrations</h2>
                <p className="text-xs text-slate-400 mt-0.5">Connect third-party service gateways, payment provider APIs, and cloud maps</p>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                {[
                  { name: 'Firebase (Push Notifications)', key: 'FCM Server Key', connected: true,  color: 'bg-amber-100 text-amber-800' },
                  { name: 'Razorpay (Payments)',           key: 'Razorpay Secret Key', connected: true, color: 'bg-emerald-100 text-emerald-800' },
                  { name: 'Google Maps API',               key: 'Maps API Key', connected: true,  color: 'bg-teal-100 text-teal-800' },
                  { name: 'Twilio (SMS Gateway)',          key: 'Auth Token', connected: false, color: 'bg-rose-100 text-rose-800' },
                  { name: 'SendGrid (Transactional Email)',key: 'API Key', connected: false, color: 'bg-sky-100 text-sky-800' },
                  { name: 'Stripe (International Pay)',    key: 'Stripe Key', connected: false, color: 'bg-indigo-100 text-indigo-800' },
                ].map(({ name, key: keyLabel, connected, color }) => (
                  <div key={name} className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 hover:border-teal-300/80 transition-all">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 text-sm font-800`}>
                        {name.charAt(0)}
                      </div>
                      <div className="flex-1 sm:hidden">
                        <p className="text-xs font-800 text-slate-900">{name}</p>
                        <p className="text-[11px] text-slate-400">{keyLabel}: ••••••••••••</p>
                      </div>
                    </div>

                    <div className="hidden sm:block flex-1 min-w-0">
                      <p className="text-sm font-800 text-slate-900">{name}</p>
                      <p className="text-xs text-slate-400">{keyLabel}: ••••••••••••</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className={clsx('text-[10px] font-800 px-2.5 py-0.5 rounded-full border', connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200')}>
                        {connected ? 'Connected' : 'Not Connected'}
                      </span>
                      <button className="btn-secondary text-xs font-700 px-3 py-1.5 rounded-xl">
                        {connected ? 'Manage' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
