import { redirect } from "next/navigation";

export default function AdminImagesRedirect() {
  redirect("/admin/projects");
}
