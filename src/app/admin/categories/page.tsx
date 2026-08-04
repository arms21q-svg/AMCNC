import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Categories</h2>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Category</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Project Categories</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted text-sm">Organize projects into categories for easy filtering.</p>
        </CardContent>
      </Card>
    </div>
  );
}
