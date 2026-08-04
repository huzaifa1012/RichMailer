import { useState } from "react";
import { Plus, Server, Lock, User, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, Info, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSmtpConfig, setProvider } from "@/store/authSlice";
import { toast } from "sonner";

const PROVIDER_CONFIGS: Record<string, { host: string; port: string; secure: boolean; label: string }> = {
  gmail: { host: "smtp.gmail.com", port: "587", secure: false, label: "Gmail" },
  // outlook: { host: "smtp.office365.com", port: "587", secure: false, label: "Outlook / Hotmail" },
  // zoho: { host: "smtp.zoho.com", port: "465", secure: true, label: "Zoho" },
  // yahoo: { host: "smtp.mail.yahoo.com", port: "465", secure: true, label: "Yahoo" },
  custom: { host: "", port: "", secure: false, label: "Custom SMTP (Advanced)" },
};

type Step = "trigger" | "configure";

const ProviderSetup = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<Step>("trigger");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [form, setForm] = useState({ host: "", port: "", user: "", password: "", secure: false });
  const [testing, setTesting] = useState(false);

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    const config = PROVIDER_CONFIGS[value];
    if (config && value !== "custom") {
      setForm((prev) => ({ ...prev, host: config.host, port: config.port, secure: config.secure }));
    } else {
      setForm((prev) => ({ ...prev, host: "", port: "", secure: false }));
    }
  };

  const isCustom = selectedProvider === "custom";

  const handleTestConnection = async () => {
    if (!form.user || !form.password) {
      toast.error("Email address and App Password are required to test");
      return;
    }
    setTesting(true);
    // Simulated test — real test requires backend support
    await new Promise((r) => setTimeout(r, 1800));
    setTesting(false);
    toast.info("Connection test requires a backend. Enable appropriate backend support to test live SMTP connections.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) {
      toast.error("Please select a provider");
      return;
    }
    if (!form.user) {
      toast.error("Email address is required");
      return;
    }
    if (!form.password) {
      toast.error("App Password is required");
      return;
    }
    if (isCustom && !form.host) {
      toast.error("SMTP Host is required for custom provider");
      return;
    }

    try {
      await dispatch(updateSmtpConfig({
        host: form.host,
        port: form.port,
        user: form.user,
        pass: form.password,
        secure: form.secure,
      })).unwrap();

      dispatch(setProvider(PROVIDER_CONFIGS[selectedProvider]?.label ?? selectedProvider));
      toast.success(`${PROVIDER_CONFIGS[selectedProvider]?.label} configured successfully!`);
    } catch (err: any) {
      toast.error(err || "Failed to save provider configuration");
    }
  };

  if (step === "trigger") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 mx-auto">
              <Server className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">No Provider Configured</h1>
            <p className="text-muted-foreground max-w-md">
              Set up a mail provider to start sending emails. Click below to get started.
            </p>
          </div>
          <Button
            onClick={() => setStep("configure")}
            size="lg"
            className="h-12 px-6 gap-2 font-semibold text-base rounded-xl shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Add Provider
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-slide-up">
      <button
        onClick={() => setStep("trigger")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Server className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Configure Mail Provider</h1>
          <p className="text-sm text-muted-foreground">Select your provider and enter credentials</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Provider Select */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Email Provider *</Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select your email provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_CONFIGS).map(([id, cfg]) => (
                  <SelectItem key={id} value={id}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-populated / locked fields for known providers */}
          {selectedProvider && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host" className="flex items-center gap-1.5 text-xs font-medium">
                    <Server className="w-3.5 h-3.5" /> SMTP Host
                  </Label>
                  <Input
                    id="host"
                    placeholder="smtp.example.com"
                    value={form.host}
                    onChange={(e) => isCustom && setForm({ ...form, host: e.target.value })}
                    readOnly={!isCustom}
                    className={`h-11 ${!isCustom ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port" className="flex items-center gap-1.5 text-xs font-medium">
                    Port
                  </Label>
                  <Input
                    id="port"
                    placeholder="465"
                    value={form.port}
                    onChange={(e) => isCustom && setForm({ ...form, port: e.target.value })}
                    readOnly={!isCustom}
                    className={`h-11 ${!isCustom ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  {form.secure ? <Wifi className="w-4 h-4 text-primary" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-medium text-foreground">Secure Connection (SSL/TLS)</span>
                </div>
                <Switch
                  checked={form.secure}
                  onCheckedChange={(val) => isCustom && setForm({ ...form, secure: val })}
                  disabled={!isCustom}
                />
              </div>

              {!isCustom && (
                <p className="text-[11px] text-muted-foreground -mt-2">
                  Host, port, and security are auto-configured for {PROVIDER_CONFIGS[selectedProvider]?.label}.
                </p>
              )}

              {/* User credentials */}
              <div className="space-y-2">
                <Label htmlFor="user" className="flex items-center gap-1.5 text-xs font-medium">
                  <User className="w-3.5 h-3.5" /> Email Address *
                </Label>
                <Input
                  id="user"
                  placeholder="your@email.com"
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" /> App Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-11 font-mono text-sm"
                  disabled={isLoading}
                />
                {selectedProvider === "gmail" && <AppPasswordGuide />}
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" className="flex-1 h-11 font-semibold gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Save & Continue</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="h-11 font-semibold gap-2"
                >
                  {testing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Testing…
                    </span>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" /> Test Connection
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const AppPasswordGuide = () => {
  const [expanded, setExpanded] = useState(false);
  const steps = [
    { step: "1", text: "Go to your Google Account at myaccount.google.com" },
    { step: "2", text: "Ensure 2-Step Verification is turned ON under the Security tab" },
    { step: "3", text: 'Search for "App passwords" in the top search bar (or under Security)' },
    { step: "4", text: "Enter a custom app name (e.g., Rich Mailer) and click Create" },
    { step: "5", text: "Copy the 16-character passcode generated by Google" },
    { step: "6", text: "Paste the passcode here (spaces are automatically ignored)" },
  ];

  return (
    <div className="rounded-lg border border-border bg-muted/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          How to get your Google App Password?
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 animate-fade-in">
          <div className="rounded-lg bg-background border border-border p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Google requires an <span className="font-semibold text-foreground">App Password</span> instead of your regular password. Follow these steps:
            </p>
            <ol className="space-y-2.5">
              {steps.map((s) => (
                <li key={s.step} className="flex gap-2.5 items-start">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {s.step}
                  </span>
                  <span className="text-xs text-foreground/80 leading-relaxed">{s.text}</span>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2 pt-1">
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                <ExternalLink className="w-3 h-3" /> Open Google App Passwords
              </a>
              <span className="text-muted-foreground text-[10px]">•</span>
              <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                <ExternalLink className="w-3 h-3" /> Google Support Guide
              </a>
            </div>
            <div className="rounded-md bg-warning/5 border border-warning/20 px-3 py-2">
              <p className="text-[11px] text-warning font-medium">
                ⚠️ 2-Step Verification must be enabled on your Google account before you can create App Passwords.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSetup;
