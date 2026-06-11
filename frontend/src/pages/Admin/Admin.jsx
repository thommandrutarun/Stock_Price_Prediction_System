import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, Terminal, Mail, BarChart3, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2, Activity, TrendingUp, Cpu } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadTabContent(activeTab);
  }, [activeTab]);

  const loadTabContent = async (tab) => {
    setLoading(true);
    setErrorMsg('');
    setMessage('');
    try {
      if (tab === 'stats') {
        const res = await api.get('/admin/system-stats');
        setStats(res.data);
      } else if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsersList(res.data.users || []);
      } else if (tab === 'logs') {
        const res = await api.get('/admin/logs');
        setAuditLogs(res.data.logs || []);
      } else if (tab === 'messages') {
        const res = await api.get('/admin/messages');
        setMessagesList(res.data.messages || []);
      } else if (tab === 'monitoring') {
        const res = await api.get('/admin/monitoring/stats');
        setTelemetry(res.data || null);
      } else if (tab === 'analytics') {
        const res = await api.get('/admin/analytics/stats');
        setAnalytics(res.data || null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Access Denied or failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteAdmin = async (userId) => {
    setActionLoading(true);
    setErrorMsg('');
    setMessage('');
    try {
      const res = await api.post('/admin/promote', { user_id: userId });
      setMessage(res.data.message);
      loadTabContent('users');
    } catch (err) {
      setErrorMsg(err.message || 'Promotion failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAdmin = async (userId) => {
    setActionLoading(true);
    setErrorMsg('');
    setMessage('');
    try {
      const res = await api.post('/admin/revoke', { user_id: userId });
      setMessage(res.data.message);
      loadTabContent('users');
    } catch (err) {
      setErrorMsg(err.message || 'Revocation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${userEmail}?`)) {
      return;
    }
    
    setActionLoading(true);
    setErrorMsg('');
    setMessage('');
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      setMessage(res.data.message);
      loadTabContent('users');
    } catch (err) {
      setErrorMsg(err.message || 'Account termination failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users list based on query text
  const filteredUsers = usersList.filter((u) => {
    const q = filterText.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.profession && u.profession.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-page-container">
      <div className="terminal-welcome-row">
        <div className="welcome-message-panel">
          <h2>Administrative Control Console</h2>
          <p>Manage registered accounts, view system audits, telemetry statistics, and support desk messages.</p>
        </div>
      </div>

      {message && <div className="admin-success-banner">{message}</div>}
      {errorMsg && <div className="admin-error-banner">{errorMsg}</div>}

      {/* ADMIN TABS PANELS */}
      <section className="admin-tabs-nav">
        <button className={`tab-nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <BarChart3 size={16} /> Overview Stats
        </button>
        <button className={`tab-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} /> User Directory
        </button>
        <button className={`tab-nav-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <Terminal size={16} /> Audit Trail
        </button>
        <button className={`tab-nav-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
          <Mail size={16} /> Support Inbox
        </button>
        <button className={`tab-nav-btn ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
          <Activity size={16} /> System Telemetry
        </button>
        <button className={`tab-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <TrendingUp size={16} /> User Analytics
        </button>
      </section>

      {/* CORE DISPLAY WINDOW */}
      <div className="admin-viewscreen glass-panel">
        {loading ? (
          <div className="admin-viewscreen-loader">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p>Syncing control panels. Interrogating system configurations...</p>
          </div>
        ) : activeTab === 'stats' && stats ? (
          <div className="admin-stats-tab">
            <h3 className="tab-title">System Metrics</h3>
            <div className="terminal-kpi-grid">
              <div className="kpi-metric-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Total Registered Accounts</span>
                  <Users size={16} className="kpi-icon-blue" />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{stats.total_users}</span>
                  <span className="kpi-change-tag pl-profit">Users</span>
                </div>
              </div>
              <div className="kpi-metric-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Watchlisted Tickers</span>
                  <TrendingUp size={16} className="kpi-icon-green" />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{stats.total_stocks_tracked}</span>
                  <span className="kpi-change-tag pl-profit">Positions</span>
                </div>
              </div>
              <div className="kpi-metric-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Most Popular Ticker</span>
                  <Activity size={16} className="kpi-icon-purple" />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{stats.most_popular_stock || 'N/A'}</span>
                  <span className="kpi-change-tag accent-purple-badge">Symbol</span>
                </div>
              </div>
              <div className="kpi-metric-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Inbound Contact Tickets</span>
                  <Mail size={16} className="kpi-icon-blue" />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{stats.total_messages}</span>
                  <span className="kpi-change-tag pl-profit">Messages</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="admin-users-tab">
            <div className="users-tab-header">
              <h3 className="tab-title">User Account Registry</h3>
              <label htmlFor="search-users-input" className="sr-only">Filter users</label>
              <input
                id="search-users-input"
                type="text"
                className="form-input search-users-input"
                placeholder="Filter users name, email, or role..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="admin-empty-indicator">
                <p>No user accounts matched the filter query.</p>
              </div>
            ) : (
              <div className="table-responsive-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th style={{ textAlign: 'center' }}>Admin Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isTargetAdmin = u.role === 'admin';
                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td className="font-bold-txt">{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || 'N/A'}</td>
                          <td>
                            <span className={`role-badge ${isTargetAdmin ? 'role-admin' : 'role-user'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="admin-action-buttons-wrap">
                              {isTargetAdmin ? (
                                <button
                                  onClick={() => handleRevokeAdmin(u.id)}
                                  className="btn btn-outline btn-sm action-btn-revoke"
                                  disabled={actionLoading}
                                  title="Revoke Admin status"
                                >
                                  <ArrowDownCircle size={14} /> Revoke
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePromoteAdmin(u.id)}
                                  className="btn btn-outline btn-sm action-btn-promote"
                                  disabled={actionLoading}
                                  title="Promote to Admin"
                                >
                                  <ArrowUpCircle size={14} /> Promote
                                </button>
                              )}
                              <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className="btn btn-outline btn-sm action-btn-delete"
                                  disabled={actionLoading}
                                  title="Terminate Account"
                                >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'logs' ? (
          <div className="admin-logs-tab">
            <h3 className="tab-title">Audit Log History</h3>
            {auditLogs.length === 0 ? (
              <div className="admin-empty-indicator">
                <p>No audit trail records found in database.</p>
              </div>
            ) : (
              <div className="table-responsive-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Admin Email</th>
                      <th>Action</th>
                      <th>Target Parameters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((l) => (
                      <tr key={l.id}>
                        <td className="log-time-col">{l.timestamp}</td>
                        <td className="font-bold-txt">{l.admin_email}</td>
                        <td>
                          <span className="log-action-badge">{l.action}</span>
                        </td>
                        <td className="log-target-col">{l.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'messages' ? (
          <div className="admin-messages-tab">
            <h3 className="tab-title">Support Desk Inbox</h3>
            {messagesList.length === 0 ? (
              <div className="admin-empty-indicator">
                <p>Support ticket inbox is currently empty.</p>
              </div>
            ) : (
              <div className="admin-messages-stack">
                {messagesList.map((msg) => (
                  <div className="admin-msg-card glass-panel" key={msg.id}>
                    <div className="msg-card-header">
                      <div className="msg-user-details">
                        <span className="msg-user-name">{msg.name}</span>
                        <span className="msg-user-email">({msg.email})</span>
                      </div>
                      <span className="msg-time">{msg.timestamp}</span>
                    </div>
                    <div className="msg-subject-row">
                      <span className="subj-lbl">Subject:</span>
                      <span className="subj-txt">{msg.subject || 'No Subject Specified'}</span>
                    </div>
                    <p className="msg-body-content">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'monitoring' && telemetry ? (
          <div className="admin-monitoring-tab">
            <h3 className="tab-title">System Telemetry & Performance Logs</h3>
            
            <div className="terminal-kpi-grid">
              <div className="kpi-metric-card" style={{ borderLeft: '4px solid var(--error)' }}>
                <div className="kpi-card-header">
                  <span className="kpi-label">API Error Failures</span>
                  <Activity size={16} style={{ color: 'var(--error)' }} />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{telemetry.counts.api_error}</span>
                  <span className="kpi-change-tag pl-loss">Faults</span>
                </div>
              </div>
              <div className="kpi-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="kpi-card-header">
                  <span className="kpi-label">Login Failures</span>
                  <Users size={16} style={{ color: '#f59e0b' }} />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{telemetry.counts.login_failure}</span>
                  <span className="kpi-change-tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Blockages</span>
                </div>
              </div>
              <div className="kpi-metric-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                <div className="kpi-card-header">
                  <span className="kpi-label">Database Exceptions</span>
                  <Terminal size={16} style={{ color: 'var(--accent-purple)' }} />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{telemetry.counts.database_error}</span>
                  <span className="kpi-change-tag accent-purple-badge">Faults</span>
                </div>
              </div>
              <div className="kpi-metric-card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
                <div className="kpi-card-header">
                  <span className="kpi-label">AI Engine Warnings</span>
                  <Cpu size={16} style={{ color: 'var(--accent-pink)' }} />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{telemetry.counts.ai_error}</span>
                  <span className="kpi-change-tag" style={{ background: 'rgba(244, 114, 182, 0.1)', color: 'var(--accent-pink)' }}>Flags</span>
                </div>
              </div>
            </div>

            <div className="monitoring-sections-grid" style={{ marginTop: '2rem' }}>
              <div className="monitoring-sec glass-panel">
                <h4 className="sec-title">Core API Performance (Average Latency)</h4>
                {telemetry.performance.length === 0 ? (
                  <p className="empty-sec-txt">No latency profiling data collected yet.</p>
                ) : (
                  <div className="table-responsive-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>API Endpoint</th>
                          <th>Avg Latency</th>
                          <th>Invocations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {telemetry.performance.map((perf, idx) => (
                          <tr key={idx}>
                            <td className="font-bold-txt">{perf.endpoint}</td>
                            <td>
                              <div className="latency-bar-container">
                                <span className="latency-val">{perf.avg_time_ms} ms</span>
                                <div className="latency-bar-track">
                                  <div 
                                    className={`latency-bar-fill ${perf.avg_time_ms > 500 ? 'latency-high' : perf.avg_time_ms > 200 ? 'latency-med' : 'latency-low'}`} 
                                    style={{ width: `${Math.min(100, perf.avg_time_ms / 10)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>{perf.count} calls</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="monitoring-sec glass-panel">
                <h4 className="sec-title">System Anomalies & Logs</h4>
                {telemetry.recent_logs.length === 0 ? (
                  <p className="empty-sec-txt">No system anomalies recorded.</p>
                ) : (
                  <div className="monitoring-logs-list">
                    {telemetry.recent_logs.map((log) => (
                      <div className={`log-entry-item log-type-${log.metric_type}`} key={log.id}>
                        <div className="log-entry-header">
                          <span className={`log-badge log-badge-${log.metric_type}`}>{log.metric_type.toUpperCase().replace('_', ' ')}</span>
                          <span className="log-time">{log.timestamp}</span>
                        </div>
                        <p className="log-msg-text">{log.message}</p>
                        {log.endpoint && <span className="log-endpoint-tag">Route: {log.endpoint}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'analytics' && analytics ? (
          <div className="admin-analytics-tab">
            <h3 className="tab-title">User Engagement & Platform Analytics</h3>
            
            <div className="terminal-kpi-grid">
              <div className="kpi-metric-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="kpi-card-header">
                  <span className="kpi-label">Total User Accounts</span>
                  <Users size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{analytics.total_users}</span>
                  <span className="kpi-change-tag pl-profit">Users</span>
                </div>
              </div>
              <div className="kpi-metric-card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
                <div className="kpi-card-header">
                  <span className="kpi-label">Daily Active Users (DAU)</span>
                  <Activity size={16} style={{ color: 'var(--accent-pink)' }} />
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-main-value">{analytics.dau_today}</span>
                  <span className="kpi-change-tag" style={{ background: 'rgba(244, 114, 182, 0.1)', color: 'var(--accent-pink)' }}>Active</span>
                </div>
              </div>
            </div>

            <div className="monitoring-sections-grid" style={{ marginTop: '2rem' }}>
              {/* Popular Symbols */}
              <div className="monitoring-sec glass-panel">
                <h4 className="sec-title">Most Popular Stock Symbols (Checked / Viewed)</h4>
                {analytics.most_viewed.length === 0 ? (
                  <p className="empty-sec-txt">No ticker searches logged yet.</p>
                ) : (
                  <div className="table-responsive-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Symbol</th>
                          <th>View Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.most_viewed.map((stock, idx) => (
                          <tr key={idx}>
                            <td className="font-bold-txt">{stock.symbol}</td>
                            <td>
                              <div className="latency-bar-container">
                                <span className="latency-val">{stock.views} views</span>
                                <div className="latency-bar-track">
                                  <div 
                                    className="latency-bar-fill latency-low" 
                                    style={{ width: `${Math.min(100, stock.views * 10)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Traded Symbols */}
              <div className="monitoring-sec glass-panel">
                <h4 className="sec-title">Most Traded Stock Symbols (Buy / Sell)</h4>
                {analytics.most_traded.length === 0 ? (
                  <p className="empty-sec-txt">No transactions recorded yet.</p>
                ) : (
                  <div className="table-responsive-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Symbol</th>
                          <th>Trade Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.most_traded.map((stock, idx) => (
                          <tr key={idx}>
                            <td className="font-bold-txt">{stock.symbol}</td>
                            <td>
                              <div className="latency-bar-container">
                                <span className="latency-val">{stock.trades} trades</span>
                                <div className="latency-bar-track">
                                  <div 
                                    className="latency-bar-fill latency-med" 
                                    style={{ width: `${Math.min(100, stock.trades * 10)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Historical Activity Logs Timeline */}
            <div className="monitoring-sec glass-panel" style={{ marginTop: '2rem' }}>
              <h4 className="sec-title">Live User Activity Feed</h4>
              {analytics.activity_logs.length === 0 ? (
                <p className="empty-sec-txt">No user activity recorded yet.</p>
              ) : (
                <div className="monitoring-logs-list" style={{ maxHeight: '400px' }}>
                  {analytics.activity_logs.map((log) => (
                    <div className={`log-entry-item log-type-${log.action}`} key={log.id}>
                      <div className="log-entry-header">
                        <span className={`log-badge log-badge-${log.action}`}>{log.action.toUpperCase()}</span>
                        <span className="log-time">{log.timestamp}</span>
                      </div>
                      <p className="log-msg-text">{log.details || `Executed action: ${log.action}`}</p>
                      <span className="log-endpoint-tag">User Email: {log.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-empty-indicator">
            <p>Select tab category to review system indicators.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
