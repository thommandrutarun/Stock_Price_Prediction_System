import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Wallet, Settings as SettingsIcon, ShieldCheck, Loader2, RefreshCw, Check } from 'lucide-react';
import './Settings.css';

const SettingsPage = () => {
  const { user, resetWallet, refreshUser, updateSettings } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [chartSettings, setChartSettings] = useState({
    defaultTimeframe: user?.settings?.defaultTimeframe || '1mo',
    defaultChartType: user?.settings?.defaultChartType || 'candlestick',
    slippage: user?.settings?.slippage || '0.05'
  });

  // Sync state if context changes (e.g. background sync completes)
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
      setChartSettings({
        defaultTimeframe: user.settings?.defaultTimeframe || '1mo',
        defaultChartType: user.settings?.defaultChartType || 'candlestick',
        slippage: user.settings?.slippage || '0.05'
      });
    }
  }, [user]);

  const handleSettingChange = async (key, value) => {
    const updated = { ...chartSettings, [key]: value };
    setChartSettings(updated);
    try {
      await updateSettings(updated);
      setMessage('Display preferences updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleWalletReset = async () => {
    setResetting(true);
    setMessage('');
    try {
      await resetWallet();
      setMessage('Simulated account balance reset to $100,000.00 successfully.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage('');
    try {
      await api.put('/auth/me', {
        name: profileForm.name,
        email: profileForm.email
      });
      await refreshUser();
      setMessage('Profile settings updated successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Failed to update profile details');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="settings-page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header className="page-section-header">
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 }}>Terminal Settings</h1>
        <p style={{ color: 'var(--db-text-variant)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          Configure virtual trading parameters, reset paper capital funds, and manage display configurations.
        </p>
      </header>

      {message && (
        <div className="kpi-change-tag pl-profit accent-blue-badge" style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={16} />
          <span>{message}</span>
        </div>
      )}

      <div className="settings-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* PROFILE CONFIG */}
        <section className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--db-primary)' }} />
            <span>Profile Details</span>
          </h3>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="settings-name-input">Full Name</label>
              <input
                id="settings-name-input"
                type="text"
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="settings-email-input">Email Address</label>
              <input
                id="settings-email-input"
                type="email"
                className="form-input"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subscription Tier</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 14px', borderRadius: '8px', width: 'fit-content' }}>
                <ShieldCheck size={18} style={{ color: 'var(--db-primary)' }} />
                <strong style={{ color: '#fff', fontSize: '0.88rem' }}>PREMIUM SUBSCRIBER</strong>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', minHeight: '38px', marginTop: '4px' }} disabled={savingProfile}>
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* SIMULATION & WALLET CAPITALS */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} style={{ color: '#8b5cf6' }} />
            <span>Virtual Capital Allocation</span>
          </h3>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--db-outline)', padding: '1.25rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>Simulated Paper Wallet</strong>
              <p style={{ color: 'var(--db-text-variant)', fontSize: '0.82rem', margin: '4px 0 0', lineHeight: '1.4' }}>
                Resetting your wallet will erase all existing simulated trades history and set your available capital to $100,000.00 USD.
              </p>
            </div>
            
            <button
              onClick={handleWalletReset}
              className="btn-alert"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', width: 'fit-content', minHeight: '38px' }}
              disabled={resetting}
            >
              {resetting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              <span>Reset Wallet Capital</span>
            </button>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="settings-slippage-select">Order Slippage Variance</label>
            <select
              id="settings-slippage-select"
              className="form-input"
              value={chartSettings.slippage}
              onChange={(e) => handleSettingChange('slippage', e.target.value)}
              title="Select order slippage"
            >
              <option value="0.00">0.00% (Instant Fill)</option>
              <option value="0.05">0.05% (Recommended)</option>
              <option value="0.10">0.10% (High Volatility)</option>
            </select>
          </div>
        </section>

        {/* DEFAULT CHART PREFERENCES */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={18} style={{ color: '#3b82f6' }} />
            <span>Display Preferences</span>
          </h3>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="settings-timeframe-select">Default Chart Timeframe</label>
            <select
              id="settings-timeframe-select"
              className="form-input"
              value={chartSettings.defaultTimeframe}
              onChange={(e) => handleSettingChange('defaultTimeframe', e.target.value)}
              title="Select default chart timeframe"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1mo">1 Month</option>
              <option value="1y">1 Year</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="settings-charttype-select">Default Chart View</label>
            <select
              id="settings-charttype-select"
              className="form-input"
              value={chartSettings.defaultChartType}
              onChange={(e) => handleSettingChange('defaultChartType', e.target.value)}
              title="Select default chart view type"
            >
              <option value="candlestick">Candlestick Bars</option>
              <option value="line">Simple Line Chart</option>
            </select>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
