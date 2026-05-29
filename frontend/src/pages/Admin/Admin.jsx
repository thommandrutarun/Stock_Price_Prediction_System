import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, Terminal, Mail, BarChart3, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2, Activity, TrendingUp } from 'lucide-react';
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
      <header className="admin-top-header">
        <div className="admin-title-row">
          <Shield size={28} className="shield-nav-icon" />
          <h1>Administrative Control Console</h1>
        </div>
        <p>Manage registered accounts, view system audits statistics, and check support desk messages.</p>
      </header>

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
            <div className="admin-stats-grid">
              <div className="stat-card glass-panel">
                <span className="stat-label">Total Registered Accounts</span>
                <span className="stat-num">{stats.total_users} Users</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-label">Watchlisted Tickers</span>
                <span className="stat-num">{stats.total_stocks_tracked} Positions</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-label">Most Popular Ticker</span>
                <span className="stat-num">{stats.most_popular_stock}</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-label">Inbound Contact Tickets</span>
                <span className="stat-num">{stats.total_messages} Messages</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="admin-users-tab">
            <div className="users-tab-header">
              <h3 className="tab-title">User Account Registry</h3>
              <input
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
            
            <div className="admin-stats-grid">
              <div className="stat-card glass-panel stat-error">
                <span className="stat-label">API Error Failures</span>
                <span className="stat-num">{telemetry.counts.api_error} Faults</span>
              </div>
              <div className="stat-card glass-panel stat-warning">
                <span className="stat-label">Login Failures</span>
                <span className="stat-num">{telemetry.counts.login_failure} Blockages</span>
              </div>
              <div className="stat-card glass-panel stat-db">
                <span className="stat-label">Database Exceptions</span>
                <span className="stat-num">{telemetry.counts.database_error} Faults</span>
              </div>
              <div className="stat-card glass-panel stat-ai">
                <span className="stat-label">AI Engine Warnings</span>
                <span className="stat-num">{telemetry.counts.ai_error} Flags</span>
              </div>
            </div>

            <div className="monitoring-sections-grid">
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
            
            <div className="admin-stats-grid">
              <div className="stat-card glass-panel stat-users">
                <span className="stat-label">Total User Accounts</span>
                <span className="stat-num">{analytics.total_users} Users</span>
              </div>
              <div className="stat-card glass-panel stat-dau">
                <span className="stat-label">Daily Active Users (DAU)</span>
                <span className="stat-num">{analytics.dau_today} Active</span>
              </div>
            </div>

            <div className="monitoring-sections-grid">
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
                <div className="monitoring-logs-list" style={{ maxHeight: '500px' }}>
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
