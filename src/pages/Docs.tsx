import { Copy, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const Docs = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [codeExample, setCodeExample] = useState<"axios" | "fetch">("axios");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const endpoints = [
    {
      id: "send-email",
      method: "POST",
      path: "/api/mail/send",
      description: "Send an email using your configured email provider",
      headers: { "Content-Type": "application/json", "x-api-key": "your_api_key_here" },
      body: { to: "recipient@example.com", subject: "Hello!", html: "<h1>Welcome!</h1>" },
      response: { success: true, message: "Email sent successfully", messageId: "msg_123456" }
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">REST API Documentation</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Simple REST API ready to integrate into your application using fetch, axios, or any HTTP client
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <QuickCard title="1. Sign Up" desc="Get your API key" />
          <QuickCard title="2. Copy Code" desc="Use the example below" />
          <QuickCard title="3. Send Email" desc="Call the API with your key" />
        </div>

        {/* API Setup Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">API Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Endpoint Card */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">API</p>
                <p className="text-sm text-muted-foreground mb-3">POST request to send emails</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 flex items-center justify-between group">
                <span className="text-green-400">POST</span>
                <span className="flex-1                                          ml-3">{baseUrl}/api/mail/send</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${baseUrl}/api/mail/send`)} className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Authentication Card */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Header</p>
                <p className="text-sm text-muted-foreground mb-3">Required for all requests</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 flex items-center justify-between group">
                <div className="flex-1">
                  <div className="text-blue-400">x-api-key:</div>
                  <div className="text-yellow-400 text-xs mt-1">your_api_key_here</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`x-api-key: your_api_key_here`)} className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>




        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Code Examples</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Integration Code</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={codeExample === "axios" ? "default" : "outline"}
                  onClick={() => setCodeExample("axios")}
                  className="px-3 py-1 text-xs"
                >
                  Axios
                </Button>
                <Button
                  size="sm"
                  variant={codeExample === "fetch" ? "default" : "outline"}
                  onClick={() => setCodeExample("fetch")}
                  className="px-3 py-1 text-xs"
                >
                  Fetch
                </Button>
              </div>
            </div>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto group relative">
              {codeExample === "axios" ? (
                <pre>{`import axios from 'axios';\n\nconst apiKey = 'your_api_key_here';\nconst apiUrl = '${baseUrl}/api/mail/send';\n\naxios.post(apiUrl, {\n  to: 'recipient@example.com',\n  subject: 'Your Subject Here',\n  html: '<h1>Welcome!</h1>'\n}, {\n  headers: {\n    'Content-Type': 'application/json',\n    'x-api-key': apiKey\n  }\n})\n.then(response => console.log('Email sent:', response.data))\n.catch(error => console.error('Error:', error.response?.data || error.message));`}</pre>
              ) : (
                  <pre>{`const apiKey = 'your_api_key_here';\nconst apiUrl = '${baseUrl}/api/mail/send';\n\nfetch(apiUrl, {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'x-api-key': apiKey\n  },\n  body: JSON.stringify({\n    to: 'recipient@example.com',\n    subject: 'Your Subject Here',\n    html: '<h1>Welcome!</h1>'\n  })\n})\n.then(res => res.json())\n.then(data => console.log('Email sent:', data))\n.catch(error => console.error('Error:', error));`}</pre>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(
                    codeExample === "axios"
                      ? `import axios from 'axios';\n\nconst apiKey = 'your_api_key_here';\nconst apiUrl = '${baseUrl}/api/mail/send';\n\naxios.post(apiUrl, {\n  to: 'recipient@example.com',\n  subject: 'Hello World',\n  html: '<h1>Welcome!</h1>'\n}, {\n  headers: {\n    'Content-Type': 'application/json',\n    'x-api-key': apiKey\n  }\n})\n.then(response => console.log('Email sent:', response.data))\n.catch(error => console.error('Error:', error.response?.data || error.message));`
                      : `const apiKey = 'your_api_key_here';\nconst apiUrl = '${baseUrl}/api/mail/send';\n\nfetch(apiUrl, {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'x-api-key': apiKey\n  },\n  body: JSON.stringify({\n    to: 'recipient@example.com',\n    subject: 'Hello World',\n    html: '<h1>Welcome!</h1>'\n  })\n})\n.then(res => res.json())\n.then(data => console.log('Email sent:', data))\n.catch(error => console.error('Error:', error));`
                  )
                }
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>


        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Send Email API</h2>
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <EndpointItem
                key={endpoint.id}
                endpoint={endpoint}
                expanded={expandedEndpoint === endpoint.id}
                onToggle={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
                baseUrl={baseUrl}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        </section>



        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Tips</h2>
          <div className="glass-card rounded-xl p-6 space-y-3 text-sm text-muted-foreground">
            <p>✓ Get API key from Dashboard after registering and logging in</p>
            <p>✓ Include x-api-key header in all API requests</p>
            <p>✓ Set Content-Type: application/json header</p>
            <p>✓ Use html field for rich email formatting</p>
            <p>✓ Keep your API key secret - never expose it in public code</p>
            <p>✓ Configure your email provider on the portal dashboard</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

interface Endpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  headers: Record<string, string> | string;
  body: any;
  response: any;
}

const EndpointItem = ({
  endpoint,
  expanded,
  onToggle,
  baseUrl,
  onCopy
}: {
  endpoint: Endpoint;
  expanded: boolean;
  onToggle: () => void;
  baseUrl: string;
  onCopy: (text: string) => void;
}) => {
  const methodColor: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    POST: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
  };

  const headers = typeof endpoint.headers === "string"
    ? { [endpoint.headers.split(":")[0]]: endpoint.headers.split(":")[1]?.trim() || "" }
    : endpoint.headers;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <span className={`px-3 py-1 rounded font-mono text-sm font-bold ${methodColor[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <div>
            <p className="font-mono text-sm text-foreground font-semibold">{endpoint.path}</p>
            <p className="text-xs text-muted-foreground">{endpoint.description}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-6 py-6 bg-muted/30 border-t border-border space-y-6">
          {/* Full URL */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Full URL</h4>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 flex items-center justify-between group">
              <span className="flex-1">{baseUrl}{endpoint.path}</span>
              <Button size="sm" variant="ghost" onClick={() => onCopy(`${baseUrl}${endpoint.path}`)} className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Headers */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Headers</h4>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 group">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key}>{key}: {value}</div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopy(Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join("\n"))}
                className="absolute mt-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Request Body */}
          {endpoint.body && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Request Body (JSON)</h4>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto group relative">
                <pre>{JSON.stringify(endpoint.body, null, 2)}</pre>
                <Button size="sm" variant="ghost" onClick={() => onCopy(JSON.stringify(endpoint.body, null, 2))} className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Response (Example)</h4>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto group relative">
              <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
              <Button size="sm" variant="ghost" onClick={() => onCopy(JSON.stringify(endpoint.response, null, 2))} className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="glass-card rounded-xl p-5 text-center">
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

const StatusCode = ({ code, text, desc }: { code: string; text: string; desc: string }) => (
  <div className="glass-card rounded-xl p-4">
    <div className="font-mono font-bold text-foreground mb-2">{code} {text}</div>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default Docs;
