// @ts-nocheck
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// XAMPP BİLGİSAYAR IP ADRESİN
const BASE_URL = "http://10.35.119.73/flora_api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default function App() {
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState("rehber"); // rehber, bahcem, asistan

  // --- REHBER VE BAHÇE STATELERİ ---
  const [bitkiler, setBitkiler] = useState([]);
  const [filtrelenmisBitkiler, setFiltrelenmisBitkiler] = useState([]);
  const [benimBahcem, setBenimBahcem] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliBitki, setSeciliBitki] = useState(null);
  const [modalGorunur, setModalGorunur] = useState(false);
  const [eklemeModaliGorunur, setEklemeModaliGorunur] = useState(false);
  const [ozelIsim, setOzelIsim] = useState("");
  const [sulamaGunu, setSulamaGunu] = useState("7");
  const [seciliBahceBitkisi, setSeciliBahceBitkisi] = useState(null);
  const [bahcemModalGorunur, setBahcemModalGorunur] = useState(false);

  // --- CHATBOT STATELERİ ---
  const [mesajlar, setMesajlar] = useState([
    {
      id: "1",
      text: "Merhaba! 🌿 Ben Flora Asistan. Bitkilerinle ilgili sormak istediğin bir şey var mı?",
      sender: "bot",
    },
  ]);
  const [yeniMesaj, setYeniMesaj] = useState("");

  const RESIM_YOLU = `${BASE_URL}/resimler/`;

  useEffect(() => {
    rehberVerileriniGetir();
    bahcemiGetir();
  }, []);

  const resimUrlOlustur = (url) => {
    if (!url)
      return "https://images.unsplash.com/photo-1597848212624-a19eb35e26f1?w=500&q=80";
    const temizUrl = url.trim();
    if (temizUrl.startsWith("http")) return temizUrl;
    return encodeURI(RESIM_YOLU + temizUrl) + "?v=" + new Date().getTime();
  };

  const rehberVerileriniGetir = () => {
    api
      .get("/bitkileri_getir.php")
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setBitkiler(data);
        setFiltrelenmisBitkiler(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Hata:", error.message);
        setLoading(false);
      });
  };

  const bahcemiGetir = () => {
    api
      .get("/bahcemi_getir.php")
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setBenimBahcem(data);
      })
      .catch((error) => console.error(error));
  };

  const aramaYap = (text) => {
    setAramaMetni(text);
    const filtrelenmisData = bitkiler.filter((item) => {
      const bitkiAdi = item.yaygin_adi ? item.yaygin_adi.toLowerCase() : "";
      const bilimselAdi = item.bilimsel_adi
        ? item.bilimsel_adi.toLowerCase()
        : "";
      return (
        bitkiAdi.includes(text.toLowerCase()) ||
        bilimselAdi.includes(text.toLowerCase())
      );
    });
    setFiltrelenmisBitkiler(filtrelenmisData);
  };

  // --- BOT MESAJ GÖNDERME FONKSİYONU ---
  const asistanMesajGonder = () => {
    if (yeniMesaj.trim() === "") return;

    // Kullanıcının mesajını ekrana ekle
    const kullaniciMesajObje = {
      id: Date.now().toString(),
      text: yeniMesaj,
      sender: "user",
    };
    setMesajlar((oncekiMesajlar) => [...oncekiMesajlar, kullaniciMesajObje]);

    const gidenMetin = yeniMesaj;
    setYeniMesaj(""); // Kutuyu temizle

    // PHP'ye mesajı gönder
    api
      .post("/chatbot.php", { mesaj: gidenMetin })
      .then((response) => {
        const botMesajObje = {
          id: (Date.now() + 1).toString(),
          text: response.data.cevap,
          sender: "bot",
        };
        setMesajlar((oncekiMesajlar) => [...oncekiMesajlar, botMesajObje]);
      })
      .catch(() => {
        const hataObje = {
          id: (Date.now() + 1).toString(),
          text: "Bağlantı hatası! Asistan şu an sunucuya ulaşamıyor. 😢",
          sender: "bot",
        };
        setMesajlar((oncekiMesajlar) => [...oncekiMesajlar, hataObje]);
      });
  };

  // --- DİĞER FONKSİYONLAR (Ekleme, Silme, Sulama) ---
  const bitkiDetayAc = (bitki) => {
    setSeciliBitki(bitki);
    setModalGorunur(true);
  };

  const bahceyeEkleMasaAc = () => {
    setOzelIsim("Benim " + seciliBitki.yaygin_adi + "m");
    setSulamaGunu("7");
    setEklemeModaliGorunur(true);
  };

  const bahceyeKaydet = () => {
    const gunSayisi = parseInt(sulamaGunu);
    api
      .post("/bahceye_ekle.php", {
        bitki_id: seciliBitki.id,
        ozel_isim: ozelIsim,
        sulama_periyodu_gun: gunSayisi,
      })
      .then(() => {
        if (Platform.OS === "web")
          window.alert("Harika! Bitki bahçene eklendi! 🌿");
        else Alert.alert("Harika!", "Bitki bahçene eklendi! 🌿");
        setEklemeModaliGorunur(false);
        setModalGorunur(false);
        bahcemiGetir();
      })
      .catch(() => {
        if (Platform.OS === "web") window.alert("Hata: Eklenemedi!");
        else Alert.alert("Hata", "Eklenemedi!");
      });
  };

  const bahceDetayAc = (bahceBitkisi) => {
    setSeciliBahceBitkisi(bahceBitkisi);
    setBahcemModalGorunur(true);
  };

  const bitkiyiSula = () => {
    api
      .post("/sula.php", { id: seciliBahceBitkisi.id })
      .then(() => {
        if (Platform.OS === "web")
          window.alert("Ellerine Sağlık! Bitkini suladın. 💧");
        else Alert.alert("Ellerine Sağlık!", "Bitkini suladın. 💧");
        setBahcemModalGorunur(false);
        bahcemiGetir();
      })
      .catch(() => {
        if (Platform.OS === "web") window.alert("Hata: Sulama kaydedilemedi!");
        else Alert.alert("Hata", "Sulama kaydedilemedi!");
      });
  };

  const bahcedenSil = () => {
    if (Platform.OS === "web") {
      const onay = window.confirm(
        `${seciliBahceBitkisi.ozel_isim} adlı bitkiyi silmek istediğine emin misin?`,
      );
      if (onay) {
        api
          .post("/bahceden_sil.php", { id: seciliBahceBitkisi.id })
          .then(() => {
            window.alert("Silindi!");
            setBahcemModalGorunur(false);
            bahcemiGetir();
          })
          .catch(() => window.alert("Hata!"));
      }
    } else {
      Alert.alert("Emin misin?", "Bu bitkiyi silmek istediğine emin misin?", [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: () => {
            api
              .post("/bahceden_sil.php", { id: seciliBahceBitkisi.id })
              .then(() => {
                Alert.alert("Silindi");
                setBahcemModalGorunur(false);
                bahcemiGetir();
              })
              .catch(() => Alert.alert("Hata"));
          },
        },
      ]);
    }
  };

  const sulamaDurumuHesapla = (sonSulamaTarihi, periyotGun) => {
    if (!sonSulamaTarihi) return { mesaj: "Su Verilmeli!", renk: "#E74C3C" };
    const farkGun = Math.ceil(
      Math.abs(new Date() - new Date(sonSulamaTarihi)) / (1000 * 60 * 60 * 24),
    );
    return farkGun >= periyotGun
      ? { mesaj: "💧 Su Verilmeli!", renk: "#E74C3C" }
      : { mesaj: `😊 Suyuna ${periyotGun - farkGun} gün var`, renk: "#27AE60" };
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#2E7D32" style={{ flex: 1 }} />
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {aktifSekme === "rehber"
          ? "Flora Rehberi"
          : aktifSekme === "bahcem"
            ? "Benim Bahçem"
            : "Flora Asistan"}
      </Text>

      {/* REHBER SEKMESİ */}
      {aktifSekme === "rehber" && (
        <>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Bitki veya ağaç ara..."
              value={aramaMetni}
              onChangeText={aramaYap}
              placeholderTextColor="#999"
            />
          </View>
          <FlatList
            data={filtrelenmisBitkiler}
            keyExtractor={(item) =>
              item?.id?.toString() || Math.random().toString()
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Bitki bulunamadı 😢</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => bitkiDetayAc(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: resimUrlOlustur(item.foto_url) }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.plantName}>{item.yaygin_adi}</Text>
                  <Text style={styles.scientificName}>{item.bilimsel_adi}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* BAHÇEM SEKMESİ */}
      {aktifSekme === "bahcem" && (
        <FlatList
          data={benimBahcem}
          keyExtractor={(item) =>
            item?.id?.toString() || Math.random().toString()
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Bahçen boş. Rehberden bitki ekle! 🌱
            </Text>
          }
          renderItem={({ item }) => {
            const durum = sulamaDurumuHesapla(
              item.son_sulama_tarihi,
              item.sulama_periyodu_gun,
            );
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => bahceDetayAc(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: resimUrlOlustur(item.foto_url) }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.plantName}>{item.ozel_isim}</Text>
                  <Text style={styles.scientificName}>
                    Orijinal Türü: {item.yaygin_adi}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: durum.renk },
                    ]}
                  >
                    <Text style={styles.statusText}>{durum.mesaj}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* CHATBOT (ASİSTAN) SEKMESİ */}
      {aktifSekme === "asistan" && (
        <View style={styles.chatWrapper}>
          <FlatList
            data={mesajlar}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatScroll}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "user"
                    ? styles.userMessage
                    : styles.botMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "user"
                      ? styles.userMessageText
                      : styles.botMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}
          />
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Asistana bir soru sor..."
              value={yeniMesaj}
              onChangeText={setYeniMesaj}
              onSubmitEditing={asistanMesajGonder}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={asistanMesajGonder}
            >
              <Text style={styles.sendButtonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ALT MENÜ */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setAktifSekme("rehber")}
        >
          <Text
            style={[
              styles.tabText,
              aktifSekme === "rehber" && styles.activeTabText,
            ]}
          >
            🌍 Keşfet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setAktifSekme("bahcem")}
        >
          <Text
            style={[
              styles.tabText,
              aktifSekme === "bahcem" && styles.activeTabText,
            ]}
          >
            🏡 Bahçem
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setAktifSekme("asistan")}
        >
          <Text
            style={[
              styles.tabText,
              aktifSekme === "asistan" && styles.activeTabText,
            ]}
          >
            🤖 Asistan
          </Text>
        </TouchableOpacity>
      </View>

      {/* REHBER DETAY MODALI */}
      <Modal
        visible={modalGorunur}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalGorunur(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {seciliBitki && (
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Image
                source={{ uri: resimUrlOlustur(seciliBitki.foto_url) }}
                style={styles.modalBiggerImage}
              />
              <Text style={styles.modalTitle}>{seciliBitki.yaygin_adi}</Text>
              <Text style={styles.modalSubTitle}>
                {seciliBitki.bilimsel_adi}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={bahceyeEkleMasaAc}
              >
                <Text style={styles.addButtonText}>➕ BAHÇEME EKLE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalGorunur(false)}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* BAHÇE DETAY MODALI */}
      <Modal
        visible={bahcemModalGorunur}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBahcemModalGorunur(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {seciliBahceBitkisi && (
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Image
                source={{ uri: resimUrlOlustur(seciliBahceBitkisi.foto_url) }}
                style={styles.modalBiggerImage}
              />
              <Text style={styles.modalTitle}>
                {seciliBahceBitkisi.ozel_isim}
              </Text>
              <TouchableOpacity
                style={styles.waterButton}
                onPress={bitkiyiSula}
              >
                <Text style={styles.waterButtonText}>💦 ŞİMDİ SULADIM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={bahcedenSil}
              >
                <Text style={styles.deleteButtonText}>🗑️ BAHÇEMDEN SİL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setBahcemModalGorunur(false)}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* EKLEME MODALI */}
      <Modal
        visible={eklemeModaliGorunur}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEklemeModaliGorunur(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Bahçene Ekle</Text>
            <TextInput
              style={styles.input}
              value={ozelIsim}
              onChangeText={setOzelIsim}
            />
            <TextInput
              style={styles.input}
              value={sulamaGunu}
              onChangeText={setSulamaGunu}
              keyboardType="numeric"
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEklemeModaliGorunur(false)}
              >
                <Text style={styles.btnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={bahceyeKaydet}>
                <Text style={styles.btnTextWhite}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5", paddingTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 10 },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    elevation: 5,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 180, resizeMode: "cover" },
  cardContent: { padding: 18 },
  plantName: { fontSize: 20, fontWeight: "bold", color: "#2C3E50" },
  scientificName: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#7F8C8D",
    marginBottom: 10,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabText: { fontSize: 15, color: "#888", fontWeight: "bold" },
  activeTabText: { color: "#2E7D32", fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: "#FAFAFA" },
  modalScroll: { padding: 20, paddingBottom: 50 },
  modalBiggerImage: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: "cover",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 5,
  },
  modalSubTitle: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#F39C12",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  waterButton: {
    backgroundColor: "#3498DB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  waterButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  closeButton: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "#E74C3C",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  deleteButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  statusBadge: {
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  statusText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formBox: {
    backgroundColor: "#FFF",
    width: "85%",
    padding: 20,
    borderRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    padding: 12,
    backgroundColor: "#EEE",
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  saveBtn: {
    padding: 12,
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  btnText: { fontSize: 16, fontWeight: "bold", color: "#555" },
  btnTextWhite: { fontSize: 16, fontWeight: "bold", color: "#FFF" },

  // --- CHATBOT STİLLERİ ---
  chatWrapper: { flex: 1, backgroundColor: "#E5DDD5" },
  chatScroll: { padding: 15, paddingBottom: 20 },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  botMessage: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  userMessageText: { color: "#000" },
  botMessageText: { color: "#333" },
  chatInputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#DDD",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
