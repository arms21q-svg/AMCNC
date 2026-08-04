import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Settings</h2>
      <Card>
        <CardHeader><CardTitle>Site Settings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted text-sm">Configure site name, contact info, working hours, and other global settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
