import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSEOPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">SEO</h2>
      <Card>
        <CardHeader><CardTitle>SEO Management</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted text-sm">
            Manage meta titles, descriptions, keywords, Open Graph images, and structured data for each page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
