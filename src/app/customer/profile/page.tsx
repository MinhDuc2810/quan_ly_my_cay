import { PublicHeader, PublicFooter } from "@/components/layout";
import ProfileContent from "@/components/common/ProfileContent";

export default function CustomerProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pt-16">
      <PublicHeader />
      
      <main className="flex-1">
        <ProfileContent />
      </main>

      <PublicFooter />
    </div>
  );
}