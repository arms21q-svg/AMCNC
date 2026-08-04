import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminSocialPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Social Links</h2>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Link</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted text-sm">Manage social media links displayed in the footer and contact page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
