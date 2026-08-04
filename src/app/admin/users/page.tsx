import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Users</h2>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add User</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Admin Users</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted text-sm">Manage admin users with role-based access control (ADMIN / SUPER_ADMIN).</p>
        </CardContent>
      </Card>
    </div>
  );
}
