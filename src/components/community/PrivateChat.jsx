import { API_BASE, SOCKET_URL } from "../../config/api.config";

export default function PrivateChat({ otherUserId, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const [messagesMaxHeight, setMessagesMaxHeight] = useState("auto");

  useEffect(() => {
    if (!otherUserId || !me) return;
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/community/private/${otherUserId}/messages?me=${me}`);
        setMessages(res.data.messages || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("identify", me);
    socket.on("receivePrivateMessage", (m) => {
      // if relevant to this conversation
      if ((String(m.senderId) === String(otherUserId) && String(m.receiverId) === String(me)) || (String(m.senderId) === String(me) && String(m.receiverId) === String(otherUserId))) {
        setMessages((s) => [...s, m]);
      }
    });

    return () => socket.disconnect();
  }, [otherUserId, me]);

  // Poll private messages every 2s (skip while input focused)
  useEffect(() => {
    if (!otherUserId || !me) return;
    let mounted = true;

    const loadMessages = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/community/private/${otherUserId}/messages?me=${me}`);
        if (!mounted) return;
        setMessages(res.data.messages || []);
      } catch (e) {
        // ignore
      }
    };

    const id = setInterval(async () => {
      try {
        const active = document.activeElement;
        if (inputRef.current && active && inputRef.current.contains(active)) return;
        if (!mounted) return;
        await loadMessages();
      } catch (e) {}
    }, 1000);

    return () => { mounted = false; clearInterval(id); };
  }, [otherUserId, me]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    const updateHeight = () => {
      try {
        const inputH = inputRef.current ? inputRef.current.offsetHeight : 0;
        const newH = window.innerHeight - inputH - 16;
        setMessagesMaxHeight(newH > 160 ? `${newH}px` : "160px");
      } catch (e) {
        setMessagesMaxHeight("auto");
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const send = async () => {
    if (!text.trim()) return;
    const payload = { senderId: me, receiverId: otherUserId, message: text.trim() };
    setMessages((s) => [...s, payload]);
    setText("");
    try {
      if (socketRef.current) socketRef.current.emit("sendPrivateMessage", payload);
      await axios.post(`${API}/api/community/private/message`, payload);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ overflowY: "auto", padding: 12, maxHeight: messagesMaxHeight }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{m.senderId?.name || (String(m.senderId) === String(me) ? "You" : "Other")}</div>
            <div style={{ background: "#fff", padding: 8, borderRadius: 8, display: "inline-block" }}>{m.message || m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 8, borderTop: "1px solid #eee" }} ref={inputRef}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, padding: 8 }} onKeyDown={(e)=>e.key==="Enter"&&send()} placeholder="Type a private message" />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
