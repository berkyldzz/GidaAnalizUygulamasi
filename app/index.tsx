import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/tabs/explore" />; // 📌 "Keşfet" sekmesine yönlendirme
}