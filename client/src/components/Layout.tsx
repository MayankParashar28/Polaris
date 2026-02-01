import AppNavbar from "@/components/AppNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppNavbar />
            <main className="flex-1 w-full relative">
                {children}
            </main>
        </div>
    );
}
