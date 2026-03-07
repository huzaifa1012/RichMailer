import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSmtpConfig, fetchSmtpConfig } from "@/store/authSlice";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, Save, Activity } from "lucide-react";
import { toast } from "sonner";

const Config = () => {
  const dispatch = useAppDispatch();
  const { user, smtpConfig, usageCount, isLoading } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState(smtpConfig);

  useEffect(() => {
    dispatch(fetchSmtpConfig());
  }, [dispatch]);

  useEffect(() => {
    setForm(smtpConfig);
  }, [smtpConfig]);

  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.host) {
      toast.error("SMTP Host is required");
      return;
    }
    try {
      await dispatch(updateSmtpConfig(form)).unwrap();
      toast.success("Configuration saved successfully");
    } catch (err: any) {
      toast.error(err || "Failed to save configuration");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Server className="w-8 h-8 text-primary" /> Mail Configuration
        </h1>
        <p className="text-muted-foreground mt-1">Configure your SMTP server settings</p>
      </div>

      <div className="glass-card rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="host">SMTP Host *</Label>
            <Input id="host" placeholder="smtp.gmail.com" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="h-11" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input id="port" placeholder="585" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} className="h-11" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-user">Email</Label>
            <Input id="smtp-user" placeholder="your-email@example.com" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="h-11 font-mono text-sm" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-password">App Password</Label>
            <Input id="smtp-password" type="password" placeholder="••••••••" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} className="h-11" disabled={isLoading} />
          </div>
          <Button type="submit" className="h-11 font-semibold gap-2" disabled={isLoading}>
            <Save className="w-4 h-4" /> {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          Usage count: <span className="font-semibold text-foreground">{usageCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Config;
