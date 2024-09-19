"use client";
import { useEffect, useState } from "react";
import { createClient } from "utils/supabase/client";
import ChatMessage from "./ChatMessage";
import AlwaysScrollIntoView from "./AlwaysScrollIntoView";
import type { FormEvent, ChangeEvent, TouchEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";

interface Message {
  content: string;
  user_id: string;
  id: string;
  created_at: string;
}
interface ChatProps {
  session: Session;
  class_id: string;
}

const Chat = ({ session, class_id }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement> | TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Handle validation here
    if (isLoading || !session?.user) return false;

    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.from("messages").insert([{ content: message, user_id: session.user.id, class_id }]);

      // Reset message input field
      setMessage("");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const supabase = createClient();

      const { data: messages, error } = await supabase.from("messages").select().eq("class_id", class_id).order("created_at", { ascending: false });

      if (!error) {
        setMessages(messages);
      } else {
        console.error(error);
      }
    };

    fetchMessages();
  }, []);
  // console.log(messages);
  // Listen to messages updates
  useEffect(() => {
    const supabase = createClient();

    const messagesChannel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: any) => {
        // Prepend new messages received
        setMessages((m) => [payload.new as Message, ...m]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  function time(timestamp: string) {
    // Crea un oggetto Date a partire dal timestamp
    const data = new Date(timestamp);

    // Estrai ore e minuti
    const ore = data.getUTCHours().toString().padStart(2, "0"); // Ore in formato 24h
    const minuti = data.getUTCMinutes().toString().padStart(2, "0"); // Minuti

    // Ritorna il risultato nel formato HH:MM
    return `${ore}:${minuti}`;
  }
  console.log(messages);
  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50">
      <div className="flex flex-row flex-none p-3 justify-between bg-slate-600">
        <h1 className="font-bold text-white">Chat App</h1>

        <Link href="/dashboard/student">Go Back</Link>
      </div>

      <div className="flex flex-col-reverse flex-auto p-6 overflow-y-auto space-y-6 space-y-reverse min-h-[0px] text-slate-900">
        <AlwaysScrollIntoView />

        {messages.length > 0 &&
          messages.map((msg) => (
            <ChatMessage key={msg.id} fromCurrentUser={msg.user_id === session!.user!.id} content={msg.content ?? ""} created_at={time(msg.created_at)} />
          ))}
      </div>

      <form className="flex flex-row flex-none p-2 bg-slate-300 gap-x-3" onSubmit={handleSendMessage}>
        <input
          className={`flex-grow bg-white rounded p-2 focus:outline-none ${isLoading ? "text-slate-600" : "text-slate-900"}`}
          autoFocus
          type="text"
          value={message}
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
        />

        <button
          className="rounded text-white px-6 bg-blue-800 hover:bg-blue-700 disabled:bg-slate-400"
          type="submit"
          disabled={isLoading || !message || !message.length}
          onTouchEnd={handleSendMessage}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
