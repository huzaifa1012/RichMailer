import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/api";

interface User {
  email: string;
  apiKey: string;
}

interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  secure?: boolean;
  usageCount?: number;
}

interface MailLog {
  id: string;
  to: string;
  subject: string;
  status: "delivered" | "failed" | "pending";
  timestamp: string;
}

interface AuthContextType {
  user: User | null;
  smtpConfig: SmtpConfig;
  mailLogs: MailLog[];
  usageCount: number;
  configuredProvider: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSmtpConfig: (config: SmtpConfig) => Promise<void>;
  sendEmail: (data: {
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
  }) => Promise<any>;
  setProvider: (provider: string) => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// mailLogs will be fetched from server once authenticated
const sampleLogs: MailLog[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [configuredProvider, setConfiguredProvider] = useState<string | null>(null);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: "",
    port: "",
    user: "",
    pass: "",
  });
  const [usageCount, setUsageCount] = useState(0);
  const [mailLogs, setMailLogs] = useState<MailLog[]>(sampleLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // on mount, try to restore user and provider from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    const storedProvider = localStorage.getItem('provider');
    if (storedProvider) {
      setConfiguredProvider(storedProvider);
    }
    if (storedKey && !user) {
      // attempt to fetch user info using apiKey
      api.get('/auth/me')
        .then(res => {
          setUser({ email: res.data.email, apiKey: storedKey });
        })
        .catch(() => {
          // invalid key, clear storage
          localStorage.removeItem('apiKey');
        });
    }
  }, [user]);

  // save key and load config when user is set
  useEffect(() => {
    if (user && user.apiKey) {
      localStorage.setItem('apiKey', user.apiKey);
      // Load SMTP config
      api.get('/config')
        .then(res => {
          setSmtpConfig(res.data);
          setUsageCount(res.data.usageCount || 0);
          // infer provider label if none stored
          if (!configuredProvider) {
            const host = res.data.host || '';
            if (host.includes('gmail')) setProvider('Gmail');
            else if (host.includes('office365') || host.includes('outlook')) setProvider('Outlook / Hotmail');
            else if (host.includes('zoho')) setProvider('Zoho');
            else if (host.includes('yahoo')) setProvider('Yahoo');
            else setProvider('Custom');
          }
        })
        .catch(err => {
          // 404 means no configuration has been saved yet, not a fatal error
          if (err.response?.status === 404) {
            console.warn('No SMTP configuration found');
            setSmtpConfig({ host: '', port: '', user: '', pass: '' });
            setUsageCount(0);
          } else {
            console.error('Failed to load config:', err);
            setError('Failed to load SMTP configuration');
          }
        });

      // also fetch mail logs
      api.get('/mail/logs')
        .then(res => setMailLogs(res.data))
        .catch(err => console.error('Failed to load mail logs:', err));
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const apiKey = res.data.apiKey;
      if (!apiKey) {
        // something went wrong (proxy, server offline, unexpected response)
        throw new Error(res.data?.message || 'No API key returned from server');
      }
      setUser({ email, apiKey });
      localStorage.setItem('apiKey', apiKey);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password });
      const apiKey = res.data.apiKey;
      setUser({ email, apiKey });
      localStorage.setItem('apiKey', apiKey);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setConfiguredProvider(null);
    setSmtpConfig({ host: "", port: "", user: "", pass: "" });
    localStorage.removeItem('apiKey');
    localStorage.removeItem('provider');
  }, []);

  const updateSmtpConfig = useCallback(async (config: SmtpConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        host: config.host,
        port: config.port,
        user: config.user,
        pass: config.pass,
        secure: config.secure,
      };
      await api.post('/config', payload);
      // fetch back the saved config (includes usageCount etc.)
      const res = await api.get('/config');
      setSmtpConfig(res.data);
      setUsageCount(res.data.usageCount || 0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to save configuration';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setProvider = useCallback((provider: string) => {
    setConfiguredProvider(provider);
    localStorage.setItem('provider', provider);
  }, []);

  const sendEmail = useCallback(async (data: { to?: string; subject?: string; text?: string; html?: string; }) => {
    const res = await api.post('/mail/send', data);
    // refresh counts and logs after sending
    try {
      const cfgRes = await api.get('/config');
      setSmtpConfig(cfgRes.data);
      setUsageCount(cfgRes.data.usageCount || 0);
    } catch { }
    try {
      const logsRes = await api.get('/mail/logs');
      setMailLogs(logsRes.data);
    } catch { }
    return res.data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        smtpConfig,
        mailLogs,
        usageCount,
        configuredProvider,
        login,
        register,
        logout,
        updateSmtpConfig,
        sendEmail,
        setProvider,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
