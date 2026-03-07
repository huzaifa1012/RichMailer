import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSmtpConfig,
  fetchMailLogs,
  updateSmtpConfig as updateSmtpConfigAction,
  sendEmail as sendEmailAction,
  setProvider,
} from "@/store/authSlice";
import { Navigate } from "react-router-dom";
import {
  Copy,
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Settings,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import ProviderSetup from "@/components/ProviderSetup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const quillStyles = `
  .quill-editor-wrapper .ql-container {
    border: 1px solid hsl(var(--input));
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  .quill-editor-wrapper .ql-editor {
    min-height: 200px;
    padding: 0.5rem;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  .quill-editor-wrapper .ql-toolbar {
    border: 1px solid hsl(var(--input));
    border-bottom: 1px solid hsl(var(--input));
    border-radius: 0.375rem 0.375rem 0 0;
    background-color: hsl(var(--muted));
  }
  .quill-editor-wrapper .ql-snow .ql-stroke {
    stroke: hsl(var(--muted-foreground));
  }
  .quill-editor-wrapper .ql-snow .ql-fill {
    fill: hsl(var(--muted-foreground));
  }
`;

const PROVIDER_CONFIGS: Record<
  string,
  { host: string; port: string; secure: boolean; label: string }
> = {
  gmail: { host: "smtp.gmail.com", port: "587", secure: false, label: "Gmail" },
  outlook: {
    host: "smtp.office365.com",
    port: "587",
    secure: false,
    label: "Outlook / Hotmail",
  },
  zoho: { host: "smtp.zoho.com", port: "465", secure: true, label: "Zoho" },
  yahoo: {
    host: "smtp.mail.yahoo.com",
    port: "465",
    secure: true,
    label: "Yahoo",
  },
  custom: { host: "", port: "", secure: false, label: "Custom SMTP (Advanced)" },
};

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, smtpConfig, usageCount, mailLogs, configuredProvider, isLoading, error } =
    useAppSelector((state) => state.auth);

  // Inject quill styles
  useEffect(() => {
    const styleId = "quill-custom-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = quillStyles;
      document.head.appendChild(style);
    }
  }, []);

  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    text: "",
    html: "",
  });
  const [configForm, setConfigForm] = useState(smtpConfig);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showSidebarForm, setShowSidebarForm] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");

  // Load config and logs on mount
  useEffect(() => {
    dispatch(fetchSmtpConfig());
    dispatch(fetchMailLogs());
  }, [dispatch]);

  // Typing animation for API Key
  useEffect(() => {
    const apiKey = sessionStorage.getItem("apiKey")?.substring(0, 22) + "...";
    if (!apiKey) return;

    setDisplayedApiKey("");
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= apiKey.length) {
        setDisplayedApiKey(apiKey.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  // Sync form when config changes
  useEffect(() => {
    // Set config but use user's email instead of stored user ID
    setConfigForm({
      ...smtpConfig,
      user: user?.email || smtpConfig.user || ""
    });
    // Initialize selectedProvider from current config if available
    if (smtpConfig?.host) {
      const provider = Object.entries(PROVIDER_CONFIGS).find(
        ([_, config]) => config.host === smtpConfig.host
      )?.[0] || "custom";
      setSelectedProvider(provider);
    }
  }, [smtpConfig, user]);

  if (!user) return <Navigate to="/login" replace />;

  // Show provider setup if no SMTP config exists
  if (!smtpConfig?.host || !smtpConfig?.user) {
    return <ProviderSetup />;
  }

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    const config = PROVIDER_CONFIGS[value];
    if (config && value !== "custom") {
      setConfigForm((prev) => ({
        ...prev,
        host: config.host,
        port: config.port,
        secure: config.secure,
      }));
    } else {
      setConfigForm((prev) => ({
        ...prev,
        host: "",
        port: "",
        secure: false,
      }));
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) {
      toast.error("Please select a provider");
      return;
    }
    if (!configForm.user) {
      toast.error("Email address is required");
      return;
    }
    if (!configForm.pass) {
      toast.error("App Password is required");
      return;
    }
    if (selectedProvider === "custom" && !configForm.host) {
      toast.error("SMTP Host is required for custom provider");
      return;
    }

    try {
      await dispatch(updateSmtpConfigAction(configForm)).unwrap();
      dispatch(setProvider(PROVIDER_CONFIGS[selectedProvider]?.label ?? selectedProvider));
      toast.success("Configuration updated successfully");
      setShowSidebarForm(false);
    } catch (err: any) {
      toast.error(err || "Failed to save configuration");
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.to || !emailForm.subject) {
      toast.error("Email and subject are required");
      return;
    }

    try {
      await dispatch(sendEmailAction(emailForm)).unwrap();
      toast.success("Email sent successfully");
      setEmailForm({ to: "", subject: "", text: "", html: "" });
    } catch (err: any) {
      toast.error(err || "Failed to send email");
    }
  };

  const delivered = mailLogs.filter((l) => l.status === "delivered").length;
  const failed = mailLogs.filter((l) => l.status === "failed").length;

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "video"],
      ["clean"],
    ],
  };
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "video",
  ];

  if (isLoading && mailLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <svg
          className="w-12 h-12 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  // Show loading or provider setup while fetching initial config
  if (!smtpConfig?.host) {
    return <ProviderSetup />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-10 animate-slide-up flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, <span className="text-gradient">{user.email}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Manage your email sending</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Send className="w-5 h-5" />}
              label="Emails Sent"
              value={usageCount.toString()}
              color="primary"
            />
            {mailLogs.length > 0 && (
              <>
                <StatCard
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  label="Delivered"
                  value={delivered.toString()}
                  color="success"
                />
                <StatCard
                  icon={<XCircle className="w-5 h-5" />}
                  label="Failed"
                  value={failed.toString()}
                  color="destructive"
                />
              </>
            )}
          </div>

          {error && (
            <div className="glass-card rounded-xl p-4 mb-6 bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Send Email Form */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Send className="w-5 h-5 text-primary" /> Send Email
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  className="h-10"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Hello"
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, subject: e.target.value })
                  }
                  className="h-10"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="html">Compose Email</Label>
                <div className="quill-editor-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={emailForm.html}
                    onChange={(val) => setEmailForm({ ...emailForm, html: val })}
                    modules={quillModules}
                    formats={quillFormats}
                    readOnly={isLoading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="gap-2"
                disabled={isLoading}
              >
                <Send className="w-4 h-4" />
                {isLoading ? "Sending..." : "Send Email"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Mail Configuration */}
      <div className="w-80 bg-muted/30 border-l border-border p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          {/* Provider Badge */}
          <div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold w-fit">
              <Settings className="w-3.5 h-3.5" />
              {selectedProvider ? PROVIDER_CONFIGS[selectedProvider]?.label || selectedProvider.toUpperCase() : "Custom"}
            </div>
          </div>

          {/* API Key Section */}
          <div className="space-y-3 pt-3 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">API Key</h3>
            <div className="flex gap-2 items-center">
              <code className="flex-1 text-xs bg-muted p-2 rounded font-mono overflow-hidden truncate min-h-[2rem] flex items-center">
                {displayedApiKey}
              </code>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const apiKey = sessionStorage.getItem("apiKey");
                  if (apiKey) {
                    navigator.clipboard.writeText(apiKey);
                    toast.success("API Key copied to clipboard!");
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>



          {/* Configuration Summary */}
          <div className="space-y-3 ">
            <h3 className="font-semibold text-sm text-foreground">Current Setup</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host:</span>
                <span className="font-mono text-foreground">{smtpConfig.host || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono text-foreground">{smtpConfig.port || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usage:</span>
                <span className="font-mono text-foreground">{usageCount}</span>
              </div>
            </div>
          </div>



          {/* Edit Config Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowSidebarForm(!showSidebarForm)}
          >
            {showSidebarForm ? "Close" : "Edit Configuration"}
          </Button>

          {/* Edit Config Form */}
          {showSidebarForm && (
            <form onSubmit={handleUpdateConfig} className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="provider-select" className="text-xs">
                  Provider
                </Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger id="provider-select" className="h-9 text-sm">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook / Hotmail</SelectItem>
                    <SelectItem value="zoho">Zoho</SelectItem>
                    <SelectItem value="yahoo">Yahoo</SelectItem>
                    <SelectItem value="custom">Custom SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="sidebar-host" className="text-xs">
                    SMTP Host *
                  </Label>
                  <Input
                    id="sidebar-host"
                    placeholder="smtp.example.com"
                    value={configForm.host}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, host: e.target.value })
                    }
                    className="h-9 text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}

              {selectedProvider === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="sidebar-port" className="text-xs">
                    Port
                  </Label>
                  <Input
                    id="sidebar-port"
                    placeholder="587"
                    value={configForm.port}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, port: e.target.value })
                    }
                    className="h-9 text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sidebar-user" className="text-xs">
                  Email *
                </Label>
                <Input
                  id="sidebar-user"
                  type="email"
                  placeholder="your-email@example.com"
                  value={configForm.user}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, user: e.target.value })
                  }
                  className="h-9 text-sm font-mono"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebar-pass" className="text-xs">
                  App Password *
                </Label>
                <Input
                  id="sidebar-pass"
                  type="password"
                  placeholder="••••••••"
                  value={configForm.pass}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, pass: e.target.value })
                  }
                  className="h-9 text-sm"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full text-xs"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => {
  const colorMap: Record<string, string> = {
    primary: "bg-accent text-accent-foreground",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    destructive: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
