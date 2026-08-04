import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

export default function AdminBackupPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Backup</h2>
      <Card>
        <CardHeader><CardTitle>Database Backup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted text-sm">
            Create and manage database backups. Supabase provides automatic daily backups on paid plans.
          </p>
          <Button className="gap-2">
            <Database className="h-4 w-4" />
            Create Backup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
