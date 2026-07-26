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
    <DashboardLayout title="Settings" subtitle="Manage your admin preferences and business configuration">
      <div className="flex gap-5">

        {/* ── Sidebar Tabs ── */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3.5 text-sm font-600 transition-all duration-150 border-b border-slate-50 last:border-0',
                  activeTab === key
                    ? 'bg-primary-50 text-primary-700 border-l-2 border-l-primary-700 pl-3.5'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                <Icon size={16} className={activeTab === key ? 'text-primary-700' : 'text-slate-400'} />
                {label}
                {activeTab === key && <ChevronRight size={14} className="ml-auto text-primary-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-base font-800 text-slate-900">Profile Information</h2>
                <p className="text-xs text-slate-400 mt-0.5">Update your personal and contact details</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-2xl font-800">
                      SA
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center shadow-sm hover:bg-primary-50 transition-all">
                      <Camera size={12} className="text-slate-500" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-700 text-slate-800">Super Admin</p>
                    <p className="text-xs text-slate-400">admin@acservice.com</p>
                    <button className="text-xs text-primary-700 font-700 mt-1 hover:underline">Change Photo</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'First Name',    value: 'Super',          icon: User },
                    { label: 'Last Name',     value: 'Admin',          icon: User },
                    { label: 'Email Address', value: 'admin@acservice.com', icon: Mail },
                    { label: 'Phone Number',  value: '+1 555-0000',    icon: Phone },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input type="text" defaultValue={value} className="input-field pl-9" />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Office Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                    <textarea rows={2} defaultValue="500 Brickell Ave, Suite 900, Miami, FL 33131" className="input-field pl-9 resize-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Bio / About</label>
                  <textarea rows={3} defaultValue="Administrator of AC Service platform, managing all operations, bookings, and customer relations." className="input-field resize-none" />
                </div>

                <button onClick={handleSave} className={clsx('btn-primary', saved && 'bg-emerald-600 hover:bg-emerald-700')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-base font-800 text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control which alerts and updates you receive</p>
              </div>
              <div className="p-6 space-y-1">
                {[
                  { label: 'New Booking Alert',         desc: 'Notify when a new booking is created', enabled: true },
                  { label: 'Booking Cancellation',       desc: 'Notify when a customer cancels',       enabled: true },
                  { label: 'Technician Status Change',   desc: 'When a technician goes on/off duty',   enabled: false },
                  { label: 'New Customer Registration',  desc: 'When a new user signs up',             enabled: true },
                  { label: 'Payment Received',           desc: 'When a payment is processed',          enabled: true },
                  { label: 'Refund Requested',           desc: 'When a customer requests a refund',    enabled: true },
                  { label: 'New Review Posted',          desc: 'When a customer leaves a review',      enabled: false },
                  { label: 'Low Wallet Balance Alert',   desc: 'When a customer wallet goes below $5', enabled: false },
                  { label: 'Emergency Booking',          desc: 'Alert for emergency service requests', enabled: true },
                  { label: 'System Maintenance Alerts',  desc: 'Platform-level alerts and warnings',   enabled: true },
                ].map(({ label, desc, enabled }) => (
                  <div key={label} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-700 text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <button className="ml-4 shrink-0">
                      {enabled
                        ? <ToggleRight size={28} className="text-primary-700" />
                        : <ToggleLeft size={28} className="text-slate-300" />
                      }
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-slate-100">
                <button onClick={handleSave} className={clsx('btn-primary', saved && 'bg-emerald-600')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="text-base font-800 text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Use a strong password to keep your account secure</p>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Current Password',  placeholder: '••••••••' },
                    { label: 'New Password',       placeholder: 'Min. 8 characters' },
                    { label: 'Confirm Password',   placeholder: 'Repeat new password' },
                  ].map(({ label, placeholder }) => (
                    <div key={label}>
                      <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                      <div className="relative">
                        <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" placeholder={placeholder} className="input-field pl-9" />
                      </div>
                    </div>
                  ))}
                  <button className="btn-primary">
                    <Shield size={15} /> Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="text-base font-800 text-slate-900">Two-Factor Authentication</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-700 text-slate-800">Authenticator App</p>
                      <p className="text-xs text-slate-400">Use Google Authenticator or similar apps</p>
                    </div>
                    <button className="btn-secondary text-xs px-4 py-2">Enable 2FA</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-base font-800 text-slate-900">Appearance</h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize the look and feel of the admin panel</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Theme */}
                <div>
                  <p className="text-xs font-700 text-slate-500 uppercase tracking-wider mb-3">Theme Mode</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'light',  label: 'Light',  preview: 'bg-white border-2 border-primary-600' },
                      { key: 'dark',   label: 'Dark',   preview: 'bg-slate-900' },
                      { key: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-slate-900' },
                    ].map(({ key, label, preview }) => (
                      <button key={key} className={clsx('p-3 rounded-xl border-2 transition-all', key === 'light' ? 'border-primary-600' : 'border-slate-200 hover:border-slate-300')}>
                        <div className={`h-12 rounded-lg mb-2 ${preview}`} />
                        <p className={clsx('text-xs font-700', key === 'light' ? 'text-primary-700' : 'text-slate-500')}>{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <p className="text-xs font-700 text-slate-500 uppercase tracking-wider mb-3">Accent Color</p>
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
                  <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Language</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select className="input-field pl-9">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>Arabic</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSave} className={clsx('btn-primary', saved && 'bg-emerald-600')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Appearance'}
                </button>
              </div>
            </div>
          )}

          {/* ── Business ── */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-base font-800 text-slate-900">Business Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Configure your business details and operating parameters</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Business Name',  value: 'AC Service Pro',        icon: Building },
                    { label: 'Support Email',  value: 'support@acservice.com', icon: Mail },
                    { label: 'Support Phone',  value: '+1 800-AC-COOL',        icon: Phone },
                    { label: 'Tax Rate (%)',   value: '8.5',                   icon: CreditCard },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" defaultValue={value} className="input-field pl-9" />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Business Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea rows={2} defaultValue="500 Brickell Ave, Suite 900, Miami, FL 33131" className="input-field pl-9 resize-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Opening Time</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="time" defaultValue="08:00" className="input-field pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Closing Time</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="time" defaultValue="22:00" className="input-field pl-9" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Accept Emergency Bookings',   enabled: true },
                    { label: 'Enable Customer Reviews',     enabled: true },
                    { label: 'Auto-assign Technicians',     enabled: false },
                    { label: 'Enable Wallet Payments',      enabled: true },
                    { label: 'Show Technician Live Tracking', enabled: true },
                  ].map(({ label, enabled }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <p className="text-sm font-600 text-slate-700">{label}</p>
                      <button>
                        {enabled
                          ? <ToggleRight size={26} className="text-primary-700" />
                          : <ToggleLeft size={26} className="text-slate-300" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSave} className={clsx('btn-primary', saved && 'bg-emerald-600')}>
                  <Save size={15} /> {saved ? 'Saved!' : 'Save Business Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {activeTab === 'integrations' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-base font-800 text-slate-900">Integrations</h2>
                <p className="text-xs text-slate-400 mt-0.5">Connect third-party services and APIs</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { name: 'Firebase (Push Notifications)', key: 'FCM Server Key', connected: true,  color: 'bg-orange-100 text-orange-700' },
                  { name: 'Stripe (Payments)',             key: 'Stripe Secret Key', connected: true, color: 'bg-violet-100 text-violet-700' },
                  { name: 'Google Maps',                   key: 'Maps API Key', connected: true,  color: 'bg-blue-100 text-blue-700' },
                  { name: 'Twilio (SMS)',                  key: 'Auth Token', connected: false, color: 'bg-red-100 text-red-700' },
                  { name: 'SendGrid (Email)',               key: 'API Key', connected: false, color: 'bg-sky-100 text-sky-700' },
                  { name: 'Razorpay',                      key: 'Key Secret', connected: false, color: 'bg-emerald-100 text-emerald-700' },
                ].map(({ name, key: keyLabel, connected, color }) => (
                  <div key={name} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 text-sm font-800`}>
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-slate-800">{name}</p>
                      <p className="text-xs text-slate-400">{keyLabel}: ••••••••••••</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-xs font-700 px-2 py-1 rounded-lg', connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                        {connected ? 'Connected' : 'Not Connected'}
                      </span>
                      <button className="btn-secondary text-xs px-3 py-1.5">
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
