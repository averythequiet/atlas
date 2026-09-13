import AdminEditor from "@/components/AdminEditor";

// The atlas is now a static site — editing happens in the browser and the
// developer downloads the resulting JSON to commit into their project.
// There is no server passphrase to gate anymore.
export default function AdminGate() {
  return <AdminEditor />;
}
