import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";
const SESSION_ID = Math.random().toString(36).slice(2);

type Message = { role: "user" | "assistant"; content: string };

export default function InterviewScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileDone, setProfileDone] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    startInterview();
  }, []);

  async function startInterview() {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/interview/start?session_id=${SESSION_ID}`);
      setMessages([{ role: "assistant", content: res.data.assistant_message }]);
    } catch {
      setMessages([{ role: "assistant", content: "Hey! Ready to build your agent? Tell me a bit about yourself — what's your vibe?" }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newHistory = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/interview/turn`, {
        session_id: SESSION_ID,
        user_message: userMsg,
        history: messages,
      });

      setMessages([...newHistory, { role: "assistant", content: res.data.assistant_message }]);
      if (res.data.profile_complete) setProfileDone(true);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Sorry, I lost my train of thought. Try again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.agentBubble]}>
            <Text style={[styles.bubbleText, item.role === "user" && styles.userText]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {loading && <ActivityIndicator style={styles.loader} color="#888" />}

      {profileDone ? (
        <View style={styles.doneBar}>
          <Text style={styles.doneText}>Your agent is ready.</Text>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type here..."
            placeholderTextColor="#555"
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
            <Text style={styles.sendText}>↑</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },
  agentBubble: { backgroundColor: "#1A1A1A", alignSelf: "flex-start" },
  userBubble: { backgroundColor: "#FFFFFF", alignSelf: "flex-end" },
  bubbleText: { color: "#FFFFFF", fontSize: 16, lineHeight: 22 },
  userText: { color: "#0A0A0A" },
  loader: { marginVertical: 8 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: "#FFFFFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#0A0A0A", fontSize: 18, fontWeight: "700" },
  doneBar: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  doneText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
});
