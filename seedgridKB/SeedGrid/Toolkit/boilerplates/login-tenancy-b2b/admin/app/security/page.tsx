import { redirect } from "next/navigation";

export default function SecurityPage() {
  redirect("/security/users/user_list");
}
