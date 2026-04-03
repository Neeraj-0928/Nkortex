import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import { ChatProvider } from "@/context/ChatContext";

export default function ChatPage() {
    return (
        <ChatProvider>
            <div className="fixed inset-0 flex bg-[#030014] overflow-hidden text-white z-50">
                {/* Background ambient lighting for dashboard */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#030014] to-[#0a0020] pointer-events-none z-0" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none z-0" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none z-0" />

                {/* Sidebar */}
                <Sidebar />

                {/* Main Chat Interface */}
                <main className="flex-1 relative z-10 flex flex-col h-full min-h-0 min-w-0">
                    <ChatInterface />
                </main>
            </div>
        </ChatProvider>
    );
}
