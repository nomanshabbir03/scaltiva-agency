import { errorBox, successBox } from "@/components/portal/form";

export type Message = { type: "error" | "success"; text: string } | null;

export default function Notice({ message }: { message: Message }) {
  if (!message) return null;
  return (
    <p role={message.type === "error" ? "alert" : "status"} className={message.type === "error" ? errorBox : successBox}>
      {message.text}
    </p>
  );
}
