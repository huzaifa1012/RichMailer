import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/api';

export interface User {
  email: string;
  apiKey: string;
}

export interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  secure?: boolean;
  usageCount?: number;
}

export interface MailLog {
  id: string;
  to: string;
  subject: string;
  status: 'delivered' | 'failed' | 'pending';
  timestamp: string;
}

interface AuthState {
  user: User | null;
  smtpConfig: SmtpConfig;
  mailLogs: MailLog[];
  usageCount: number;
  configuredProvider: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  smtpConfig: {
    host: '',
    port: '',
    user: '',
    pass: '',
  },
  mailLogs: [],
  usageCount: 0,
  configuredProvider: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const apiKey = res.data.apiKey;
      if (!apiKey) {
        throw new Error(res.data?.message || 'No API key returned from server');
      }
      return { email: credentials.email, apiKey };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', credentials);
      const apiKey = res.data.apiKey;
      if (!apiKey) {
        throw new Error('No API key returned from server');
      }
      return { email: credentials.email, apiKey };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchUserMe = createAsyncThunk(
  'auth/fetchUserMe',
  async (apiKey: string, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return { email: res.data.email, apiKey };
    } catch (err: any) {
      return rejectWithValue('Failed to fetch user info');
    }
  }
);

export const fetchSmtpConfig = createAsyncThunk(
  'auth/fetchSmtpConfig',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/config');
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      return rejectWithValue('Failed to load SMTP configuration');
    }
  }
);

export const fetchMailLogs = createAsyncThunk(
  'auth/fetchMailLogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/mail/logs');
      return res.data;
    } catch (err: any) {
      return rejectWithValue('Failed to load mail logs');
    }
  }
);

export const updateSmtpConfig = createAsyncThunk(
  'auth/updateSmtpConfig',
  async (config: SmtpConfig, { rejectWithValue }) => {
    try {
      const payload = {
        host: config.host,
        port: config.port,
        user: config.user,
        pass: config.pass,
        secure: config.secure,
      };
      await api.post('/config', payload);
      const res = await api.get('/config');
      return res.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to save configuration';
      return rejectWithValue(errorMsg);
    }
  }
);

export const sendEmail = createAsyncThunk(
  'auth/sendEmail',
  async (
    data: { to?: string; subject?: string; text?: string; html?: string },
    { rejectWithValue }
  ) => {
    try {
      await api.post('/mail/send', data);
      // Refresh config and logs after sending
      const cfgRes = await api.get('/config');
      const logsRes = await api.get('/mail/logs');
      return { config: cfgRes.data, logs: logsRes.data };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to send email';
      return rejectWithValue(errorMsg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.configuredProvider = null;
      state.smtpConfig = {
        host: '',
        port: '',
        user: '',
        pass: '',
      };
      state.error = null;
    },
    setProvider: (state, action) => {
      state.configuredProvider = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User Me
    builder
      .addCase(fetchUserMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchUserMe.rejected, (state) => {
        state.user = null;
      });

    // Fetch SMTP Config
    builder
      .addCase(fetchSmtpConfig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSmtpConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.smtpConfig = action.payload;
          state.usageCount = action.payload.usageCount || 0;
        }
      })
      .addCase(fetchSmtpConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Mail Logs
    builder
      .addCase(fetchMailLogs.fulfilled, (state, action) => {
        state.mailLogs = action.payload;
      });

    // Update SMTP Config
    builder
      .addCase(updateSmtpConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSmtpConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.smtpConfig = action.payload;
        state.usageCount = action.payload.usageCount || 0;
      })
      .addCase(updateSmtpConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send Email
    builder
      .addCase(sendEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.smtpConfig = action.payload.config;
        state.usageCount = action.payload.config.usageCount || 0;
        state.mailLogs = action.payload.logs;
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setProvider, clearError } = authSlice.actions;
export default authSlice.reducer;
