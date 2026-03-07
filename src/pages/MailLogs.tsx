import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMailLogs } from "@/store/authSlice";
import { Navigate } from "react-router-dom";
import { ScrollText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MailLogs = () => {
  const dispatch = useAppDispatch();
  const { user, mailLogs, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMailLogs());
  }, [dispatch]);

  if (!user) return <Navigate to="/login" replace />;

  const statusConfig = {
    delivered: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    failed: { icon: <XCircle className="w-3.5 h-3.5" />, class: "bg-red-100 text-red-700 border-red-200" },
    pending: { icon: <Clock className="w-3.5 h-3.5" />, class: "bg-amber-100 text-amber-700 border-amber-200" },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-primary" /> Mail Logs
        </h1>
        <p className="text-muted-foreground mt-1">View your email delivery history</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">Recipient</div>
          <div className="col-span-4">Subject</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Time</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {isLoading && mailLogs.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Loading mail logs...
            </div>
          )}
          {!isLoading && mailLogs.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No emails have been sent yet.
            </div>
          )}
          {mailLogs.map((log) => {
            const config = statusConfig[log.status];
            const time = new Date(log.timestamp);
            return (
              <div key={log.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                <div className="sm:col-span-4">
                  <span className="text-sm font-medium text-foreground">{log.to}</span>
                </div>
                <div className="sm:col-span-4">
                  <span className="text-sm text-muted-foreground">{log.subject}</span>
                </div>
                <div className="sm:col-span-2">
                  <Badge variant="outline" className={`gap-1 text-xs font-medium border ${config.class}`}>
                    {config.icon} {log.status}
                  </Badge>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground">
                    {time.toLocaleDateString()} {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MailLogs;
