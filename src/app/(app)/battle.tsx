import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Animated, ScrollView, ActivityIndicator, Dimensions
} from "react-native";
import { useTeam } from "@/context/TeamContext";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

// ─── Paleta ───────────────────────────────────────────────────────────────────

const C = {
  bodyRed:      "#CC1010",
  frFight:      "#FF6B7A",
  frFightDark:  "#C83040",
  frPokemon:    "#50C878",
  frPokemonD:   "#2E8B57",
  frRun:        "#4FAFFF",
  frRunDark:    "#1A65A0",
  frAuto:       "#D4AC0D",
  frAutoDark:   "#9A7D0A",
  battleSky:    "#D0F0FF",
  battleGround: "#70C8A0",
  textDark:     "#404040",
  hpGreen:      "#00C800",
  hpYellow:     "#F8D000",
  hpRed:        "#F80000",
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface Pokemon {
  id: number;
  name: string;
  image: string;
  tipos: string[];
  stats: PokemonStats;
}

interface BattlePokemon extends Pokemon {
  currentHp: number;
  maxHp: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBackSprite  = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;
const getFrontSprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Transforma um Pokemon do TeamContext em BattlePokemon — sem nenhum fetch
function toBattlePokemon(p: Pokemon): BattlePokemon {
  const hp = p.stats.hp || 50;
  return { ...p, currentHp: hp, maxHp: hp };
}

// ─── Componente HpBar ─────────────────────────────────────────────────────────

function HpBar({ current, max, small }: { current: number; max: number; small?: boolean }) {
  const safeCurrent = Math.max(0, current);
  const pct   = max > 0 ? Math.min(100, (safeCurrent / max) * 100) : 0;
  const color = pct > 50 ? C.hpGreen : pct > 20 ? C.hpYellow : C.hpRed;
  return (
    <View style={S.hpBarBox}>
      <View style={S.hpTrackOuter}>
        <View style={S.hpTrackInner}>
          <View style={[S.hpFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
      {!small && <Text style={S.hpNums}>{safeCurrent}/{max}</Text>}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function Battle() {
  const { user } = useAuth();
  const { team, isLoadingTeam, capturePokemon } = useTeam();

  type Phase = "waiting" | "ready" | "loading" | "battle" | "end";
  const [phase,      setPhase]      = useState<Phase>("waiting");
  const [loadingMsg, setLoadingMsg] = useState("Carregando...");

  const [myPokemon,    setMyPokemon]    = useState<BattlePokemon | null>(null);
  const [enemyPokemon, setEnemyPokemon] = useState<BattlePokemon | null>(null);
  const [myTeam,       setMyTeam]       = useState<BattlePokemon[]>([]);
  const [enemyQueue,   setEnemyQueue]   = useState<BattlePokemon[]>([]);
  const [isAutoMode,   setIsAutoMode]   = useState(false);

  const [sessionCaptures, setSessionCaptures] = useState<string[]>([]);

  const myHpSync    = useRef<number>(100);
  const enemyHpSync = useRef<number>(100);

  const [log,          setLog]          = useState("Pressione INICIAR BATALHA para comecar!");
  const [showSwap,     setShowSwap]     = useState(false);
  const [isAnimating,  setIsAnimating]  = useState(false);

  const [mySelectedStat,    setMySelectedStat]    = useState<{ name: string; val: number } | null>(null);
  const [enemySelectedStat, setEnemySelectedStat] = useState<{ name: string; val: number } | null>(null);

  const myX      = useRef(new Animated.Value(0)).current;
  const myY      = useRef(new Animated.Value(0)).current;
  const enemyX   = useRef(new Animated.Value(0)).current;
  const enemyY   = useRef(new Animated.Value(0)).current;
  const myFlash    = useRef(new Animated.Value(1)).current;
  const enemyFlash = useRef(new Animated.Value(1)).current;

  // Controla a fase conforme o time carrega
  useEffect(() => {
    if (isLoadingTeam) { setPhase("waiting"); return; }
    if (phase === "waiting" || phase === "ready") setPhase("ready");
  }, [isLoadingTeam, team]);

  // ── Animações ─────────────────────────────────────────────────────────────

  const animateDash = (attacker: "my" | "enemy") =>
    new Promise<void>((resolve) => {
      const transX   = attacker === "my" ? myX : enemyX;
      const transY   = attacker === "my" ? myY : enemyY;
      const toValueX = attacker === "my" ? 35 : -35;
      const toValueY = attacker === "my" ? -20 : 20;
      Animated.sequence([
        Animated.timing(transX, { toValue: toValueX, duration: 120, useNativeDriver: true }),
        Animated.timing(transY, { toValue: toValueY, duration: 60,  useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(transX, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(transY, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
      ]).start(() => resolve());
    });

  const animateBlink = (target: "my" | "enemy") =>
    new Promise<void>((resolve) => {
      const flash = target === "my" ? myFlash : enemyFlash;
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.1, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 1,   duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0.1, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 1,   duration: 60, useNativeDriver: true }),
      ]).start(() => resolve());
    });

  // ── fetchEnemyPokemon ─────────────────────────────────────────────────────
  // Usado SOMENTE para os inimigos aleatórios — busca na PokeAPI pública.

  const fetchEnemyPokemon = async (id: number): Promise<BattlePokemon> => {
    const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    const hp   = Math.floor(data.stats[0].base_stat);
    return {
      id:    data.id,
      name:  data.name.charAt(0).toUpperCase() + data.name.slice(1),
      image: getFrontSprite(data.id),
      tipos: data.types.map((t: any) => t.type.name),
      currentHp: hp,
      maxHp: hp,
      stats: {
        hp,
        attack:         data.stats[1].base_stat,
        defense:        data.stats[2].base_stat,
        specialAttack:  data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed:          data.stats[5].base_stat,
      },
    };
  };

  // ── startBattle ───────────────────────────────────────────────────────────

  const startBattle = async () => {
    if (!team || team.length === 0) {
      setLog("Seu time esta vazio! Va a tela de Equipe e adicione Pokemon.");
      return;
    }

    setPhase("loading");
    setLoadingMsg("Carregando Arena...");
    setSessionCaptures([]);

    // Time do jogador: converte direto do TeamContext, SEM nenhum fetch
    // Os stats (HP, ataque, defesa, velocidade) já vêm da API do jogo
    const myBattle = team.map(toBattlePokemon);

    // Inimigos: 3 aleatórios da PokeAPI (geração 1)
    const ids: number[] = [];
    while (ids.length < 3) {
      const randomId = Math.floor(Math.random() * 151) + 1;
      if (!ids.includes(randomId)) ids.push(randomId);
    }

    try {
      const enemies = await Promise.all(ids.map(id => fetchEnemyPokemon(id)));

      setMyTeam(myBattle);
      setMyPokemon(myBattle[0]);
      myHpSync.current = myBattle[0].currentHp;

      setEnemyQueue(enemies.slice(1));
      setEnemyPokemon(enemies[0]);
      enemyHpSync.current = enemies[0].currentHp;

      setLog(`Duelo Iniciado! O oponente enviou ${enemies[0].name.toUpperCase()}.`);
      setPhase("battle");
    } catch (err) {
      console.error("Erro ao carregar inimigos:", err);
      setLog("Erro ao carregar a batalha.");
      setPhase("ready");
    }
  };

  // ── handleEnemyDefeated ───────────────────────────────────────────────────

  const handleEnemyDefeated = async (defeated: BattlePokemon) => {
    setLog(`${defeated.name.toUpperCase()} foi derrotado! Capturando...`);

    const success = await capturePokemon({
      id:    defeated.id,
      name:  defeated.name,
      image: defeated.image,
      tipos: defeated.tipos,
      stats: defeated.stats,
    });

    if (success) {
      setSessionCaptures(prev => [...prev, defeated.name]);
      setLog(`${defeated.name.toUpperCase()} foi capturado!`);
    } else {
      setLog(`${defeated.name.toUpperCase()} foi derrotado, mas a captura falhou.`);
    }

    await new Promise(r => setTimeout(r, 1400));

    if (enemyQueue.length > 0) {
      const [next, ...rest] = enemyQueue;
      enemyHpSync.current = next.currentHp;
      setEnemyQueue(rest);
      setEnemyPokemon(next);
      setLog(`O proximo oponente e ${next.name.toUpperCase()}!`);
    } else {
      setPhase("end");
      setIsAutoMode(false);
    }
  };

  // ── executeStatusClash ────────────────────────────────────────────────────

  const executeStatusClash = async () => {
    if (!myPokemon || !enemyPokemon || isAnimating || enemyHpSync.current <= 0 || myHpSync.current <= 0) return;

    setIsAnimating(true);
    const statKeys = ["ATTACK", "DEFENSE", "SPEED"];

    for (let i = 0; i < 4; i++) {
      setMySelectedStat({    name: statKeys[i % statKeys.length],       val: Math.floor(Math.random() * 80) + 15 });
      setEnemySelectedStat({ name: statKeys[(i + 1) % statKeys.length], val: Math.floor(Math.random() * 80) + 15 });
      await new Promise(r => setTimeout(r, 150));
    }

    const myPickedKey   = statKeys[Math.floor(Math.random() * statKeys.length)];
    const myValue       = myPickedKey === "ATTACK"  ? myPokemon.stats.attack
                        : myPickedKey === "DEFENSE" ? myPokemon.stats.defense
                        : myPokemon.stats.speed;
    setMySelectedStat({ name: myPickedKey, val: myValue });

    const enemyPickedKey = statKeys[Math.floor(Math.random() * statKeys.length)];
    const enemyValue     = enemyPickedKey === "ATTACK"  ? enemyPokemon.stats.attack
                         : enemyPickedKey === "DEFENSE" ? enemyPokemon.stats.defense
                         : enemyPokemon.stats.speed;
    setEnemySelectedStat({ name: enemyPickedKey, val: enemyValue });

    await new Promise(r => setTimeout(r, 800));

    let currentMyPokemon    = { ...myPokemon };
    let currentEnemyPokemon = { ...enemyPokemon };

    if (myValue > enemyValue) {
      setLog(`Seu ${myPickedKey} venceu a rodada!`);
      await animateDash("my");
      await animateBlink("enemy");
      const dmg = Math.max(15, Math.floor((myValue - enemyValue) * 0.8) + 12);
      currentEnemyPokemon.currentHp = Math.max(0, currentEnemyPokemon.currentHp - dmg);
      enemyHpSync.current = currentEnemyPokemon.currentHp;
      setEnemyPokemon(currentEnemyPokemon);
    } else if (enemyValue > myValue) {
      setLog(`O oponente dominou usando ${enemyPickedKey}.`);
      await animateDash("enemy");
      await animateBlink("my");
      const dmg = Math.max(15, Math.floor((enemyValue - myValue) * 0.8) + 12);
      currentMyPokemon.currentHp = Math.max(0, currentMyPokemon.currentHp - dmg);
      myHpSync.current = currentMyPokemon.currentHp;
      setMyTeam(prev => prev.map(p => p.id === currentMyPokemon.id ? currentMyPokemon : p));
      setMyPokemon(currentMyPokemon);
    } else {
      setLog("Empate nos atributos! Nenhum dano gerado.");
      await animateDash("my");
      await animateDash("enemy");
    }

    await new Promise(r => setTimeout(r, 1200));
    setMySelectedStat(null);
    setEnemySelectedStat(null);

    if (enemyHpSync.current <= 0) {
      setIsAnimating(false);
      await handleEnemyDefeated(currentEnemyPokemon);
      return;
    }

    if (myHpSync.current <= 0) {
      setIsAutoMode(false);
      setLog("Seu Pokemon desmaiou! Menu PKMN liberado para substituicao.");
      await new Promise(r => setTimeout(r, 800));
      const alive = myTeam.filter(p => p.currentHp > 0 && p.id !== currentMyPokemon.id);
      if (alive.length > 0) setShowSwap(true);
      else setPhase("end");
    }

    setIsAnimating(false);
  };

  // ── Auto-modo ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAutoMode || isAnimating || phase !== "battle") return;
    if (enemyHpSync.current <= 0 || myHpSync.current <= 0) return;
    const timer = setTimeout(() => executeStatusClash(), 1200);
    return () => clearTimeout(timer);
  }, [isAutoMode, isAnimating, phase]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={S.mainContainer}>
      <View style={S.gameboyCase}>

        <View style={S.gbChassisTop}>
          <View style={S.pokedexLens}><View style={S.pokedexLensInner} /></View>
          <Text style={S.gbBrandText}>GAME BOY ADVANCE MAX</Text>
        </View>

        <View style={S.lcdContainer}>

          {phase === "waiting" && (
            <View style={[S.lcdScreenContainer, { justifyContent: "center", alignItems: "center" }]}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={[S.classicLogText, { color: "#FFF", marginTop: 10 }]}>
                Carregando seu time...
              </Text>
            </View>
          )}

          {phase === "ready" && (
            <View style={[S.lcdScreenContainer, { justifyContent: "center", alignItems: "center", gap: 16 }]}>
              <Text style={S.lcdTitle}>ARENA POKEMON</Text>
              <Text style={S.warningText}>
                Treinador: {user ? String(user).toUpperCase() : "Desconectado"}
              </Text>

              {team.length > 0 ? (
                <>
                  <Text style={[S.classicLogText, { textAlign: "center" }]}>
                    Time atual ({team.length}/5):
                  </Text>
                  <View style={S.teamPreviewRow}>
                    {team.map(p => (
                      <Image key={p.id} source={{ uri: p.image }} style={S.teamThumb} />
                    ))}
                  </View>
                  <TouchableOpacity style={S.startBattleBtn} onPress={startBattle}>
                    <Text style={S.startBattleBtnText}>INICIAR BATALHA</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={[S.warningText, { textAlign: "center", marginTop: 10 }]}>
                  Nenhum Pokemon no time.{"\n"}Va a tela de Equipe e adicione Pokemon!
                </Text>
              )}
            </View>
          )}

          {phase === "loading" && (
            <View style={[S.lcdScreenContainer, { justifyContent: "center", alignItems: "center" }]}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={S.classicLogText}>{loadingMsg}</Text>
            </View>
          )}

          {phase === "battle" && (
            <View style={{ flex: 1 }}>
              <View style={S.battleSky} />
              <View style={S.battleGround} />

              {enemyPokemon && (
                <View style={S.enemyZone}>
                  <View style={S.statusHud}>
                    <Text style={S.pokeNameText}>{enemyPokemon.name.toUpperCase()}</Text>
                    <HpBar current={enemyPokemon.currentHp} max={enemyPokemon.maxHp} small />
                    <View style={S.miniStatsBox}>
                      <Text style={S.miniStatsTxt}>
                        ATK {enemyPokemon.stats.attack}  DEF {enemyPokemon.stats.defense}  SPD {enemyPokemon.stats.speed}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Animated.Image
                      source={{ uri: getFrontSprite(enemyPokemon.id) }}
                      style={[S.spriteFront, { transform: [{ translateX: enemyX }, { translateY: enemyY }], opacity: enemyFlash }]}
                    />
                    {enemySelectedStat && (
                      <View style={S.rouletteBadge}>
                        <Text style={S.rouletteBadgeText}>{enemySelectedStat.name}: {enemySelectedStat.val}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {myPokemon && (
                <View style={S.myZone}>
                  <View style={{ alignItems: "center" }}>
                    <Animated.Image
                      source={{ uri: getBackSprite(myPokemon.id) }}
                      style={[S.spriteBack, { transform: [{ translateX: myX }, { translateY: myY }], opacity: myFlash }]}
                    />
                    {mySelectedStat && (
                      <View style={[S.rouletteBadge, { backgroundColor: "#FFCB05" }]}>
                        <Text style={[S.rouletteBadgeText, { color: "#000" }]}>{mySelectedStat.name}: {mySelectedStat.val}</Text>
                      </View>
                    )}
                  </View>
                  <View style={S.statusHud}>
                    <Text style={S.pokeNameText}>{myPokemon.name.toUpperCase()}</Text>
                    <HpBar current={myPokemon.currentHp} max={myPokemon.maxHp} />
                    <View style={S.miniStatsBox}>
                      <Text style={S.miniStatsTxt}>
                        ATK {myPokemon.stats.attack}  DEF {myPokemon.stats.defense}  SPD {myPokemon.stats.speed}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {phase === "end" && (
            <View style={[S.lcdScreenContainer, { justifyContent: "center", alignItems: "center", gap: 15 }]}>
              <Text style={[S.lcdTitle, { fontSize: 20 }]}>COMBATE FINALIZADO</Text>
              {sessionCaptures.length > 0 ? (
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Text style={S.warningText}>Pokemon capturados:</Text>
                  {sessionCaptures.map(name => (
                    <Text key={name} style={[S.classicLogText, { color: "#51F542" }]}>
                      + {name.toUpperCase()}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={S.warningText}>Nenhum Pokemon capturado.</Text>
              )}
              <View style={{ flexDirection: "row", gap: 14 }}>
                <TouchableOpacity
                  style={[S.frBtnPokemon, { paddingHorizontal: 25, paddingVertical: 10 }]}
                  onPress={() => { setPhase("ready"); setSessionCaptures([]); }}
                >
                  <Text style={S.frBtnText}>REJOGAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[S.frBtnFlee, { paddingHorizontal: 25, paddingVertical: 10 }]}
                  onPress={() => router.replace("/home")}
                >
                  <Text style={S.frBtnText}>VOLTAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showSwap && (
            <View style={S.internalOverlay}>
              <Text style={S.swapTitle}>SUBSTITUICAO EMERGENCIAL</Text>
              <ScrollView style={{ flex: 1, width: "100%" }} contentContainerStyle={{ gap: 8 }}>
                {myTeam.map((p) => {
                  const isDead    = p.currentHp <= 0;
                  const isCurrent = p.id === myPokemon?.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[S.swapItemRow, isDead && { backgroundColor: "#FADBD8" }, isCurrent && { borderColor: C.frFight }]}
                      disabled={isDead || isCurrent}
                      onPress={() => {
                        setMyPokemon(p);
                        myHpSync.current = p.currentHp;
                        setShowSwap(false);
                        setLog(`Troca efetuada! Vai, ${p.name.toUpperCase()}!`);
                      }}
                    >
                      <Image source={{ uri: getFrontSprite(p.id) }} style={S.swapListSprite} />
                      <Text style={S.swapListName}>{p.name.toUpperCase()}</Text>
                      <View style={S.swapListHpCenter}>
                        <HpBar current={p.currentHp} max={p.maxHp} small />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {myPokemon && myPokemon.currentHp > 0 && (
                <TouchableOpacity style={S.backMovesBtn} onPress={() => setShowSwap(false)}>
                  <Text style={S.backMovesBtnTxt}>FECHAR</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        </View>

        <View style={S.controlSection}>
          {phase === "battle" ? (
            <View style={S.fireRedActionRow}>
              <View style={S.classicLogBox}>
                <Text style={S.classicLogText}>{log}</Text>
              </View>
              <View style={S.frMenuGrid}>
                <View style={{ flexDirection: "row", gap: 4, flex: 1 }}>
                  <TouchableOpacity
                    style={[S.frBtnFight, { flex: 1 }, (isAnimating || isAutoMode) && S.btnDisabled]}
                    onPress={() => !(isAnimating || isAutoMode) && executeStatusClash()}
                  >
                    <Text style={S.frBtnText}>FIGHT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
  style={[
    S.frBtnPokemon, 
    { flex: 1 }, 
    (isAnimating || isAutoMode) && S.btnDisabled
  ]}
  disabled={isAnimating || isAutoMode}
  onPress={() => setShowSwap(true)}
>
  <Text style={S.frBtnText}>PKMN</Text>
</TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", gap: 4, flex: 1 }}>
                  <TouchableOpacity
                    style={[S.frBtnAuto, { flex: 1 }, isAnimating && S.btnDisabled]}
                    onPress={() => !isAnimating && setIsAutoMode(!isAutoMode)}
                  >
                    <Text style={S.frBtnText}>{isAutoMode ? "MANUAL" : "AUTO"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[S.frBtnFlee, { flex: 1 }, (isAnimating || isAutoMode) && S.btnDisabled]}
                    onPress={() => { setIsAutoMode(false); setPhase("ready"); }}
                  >
                    <Text style={S.frBtnText}>RUN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={[S.fireRedActionRow, { justifyContent: "center", alignItems: "center" }]}>
              <Text style={[S.classicLogText, { color: "#AAA" }]}>
                {phase === "waiting" ? "Carregando time..." : phase === "loading" ? "Preparando arena..." : "Aguardando..."}
              </Text>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const { width: screenWidth } = Dimensions.get("window");
const computedWidth = Math.min(screenWidth * 0.95, 850);

const S = StyleSheet.create({
  mainContainer:      { flex: 1, backgroundColor: "#141414", alignItems: "center", justifyContent: "center" },
  gameboyCase:        { width: computedWidth, backgroundColor: C.bodyRed, borderRadius: 24, borderWidth: 5, borderColor: "#000", padding: 12 },
  gbChassisTop:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  gbBrandText:        { color: "#FFF", fontFamily: "monospace", fontWeight: "bold", fontSize: 13, letterSpacing: 1 },
  lcdContainer:       { width: "100%", aspectRatio: 1.8, backgroundColor: "#222", borderWidth: 4, borderColor: "#111", borderRadius: 8, overflow: "hidden" },
  lcdScreenContainer: { flex: 1, backgroundColor: "#70C8A0", padding: 12 },
  battleSky:          { position: "absolute", top: 0, left: 0, right: 0, height: "60%", backgroundColor: C.battleSky },
  battleGround:       { position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", backgroundColor: C.battleGround },
  enemyZone:          { position: "absolute", top: "5%", right: "4%", flexDirection: "row", alignItems: "center" },
  myZone:             { position: "absolute", bottom: "5%", left: "4%", flexDirection: "row", alignItems: "center" },
  spriteFront:        { width: 70, height: 70, resizeMode: "contain" },
  spriteBack:         { width: 85, height: 85, resizeMode: "contain" },
  statusHud:          { backgroundColor: "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: "#333", borderRadius: 6, padding: 4, minWidth: 120 },
  pokeNameText:       { fontFamily: "monospace", fontSize: 9, fontWeight: "bold", color: "#111" },
  miniStatsBox:       { marginTop: 2, paddingTop: 1, borderTopWidth: 0.5, borderColor: "#CCC" },
  miniStatsTxt:       { fontFamily: "monospace", fontSize: 7, color: "#444", fontWeight: "bold" },
  rouletteBadge:      { position: "absolute", bottom: -6, backgroundColor: "#CC1414", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  rouletteBadgeText:  { color: "#FFF", fontFamily: "monospace", fontSize: 7, fontWeight: "bold" },
  controlSection:     { marginTop: 10, backgroundColor: "#2C2C2C", borderRadius: 8, borderWidth: 2, borderColor: "#000" },
  fireRedActionRow:   { flexDirection: "row", height: 85 },
  classicLogBox:      { flex: 1.2, backgroundColor: "#FFF", padding: 10, justifyContent: "center", borderRightWidth: 2, borderColor: "#000" },
  classicLogText:     { fontFamily: "monospace", fontSize: 10, fontWeight: "bold", color: C.textDark },
  frMenuGrid:         { flex: 1, backgroundColor: "#404040", padding: 4, gap: 4 },
  frBtnFight:         { backgroundColor: C.frFight,   borderBottomWidth: 3, borderColor: C.frFightDark, borderRadius: 4, justifyContent: "center", alignItems: "center" },
  frBtnPokemon:       { backgroundColor: C.frPokemon, borderBottomWidth: 3, borderColor: C.frPokemonD,  borderRadius: 4, justifyContent: "center", alignItems: "center" },
  frBtnFlee:          { backgroundColor: C.frRun,     borderBottomWidth: 3, borderColor: C.frRunDark,   borderRadius: 4, justifyContent: "center", alignItems: "center" },
  frBtnAuto:          { backgroundColor: C.frAuto,    borderBottomWidth: 3, borderColor: C.frAutoDark,  borderRadius: 4, justifyContent: "center", alignItems: "center" },
  frBtnText:          { color: "#FFF", fontFamily: "monospace", fontWeight: "bold", fontSize: 10 },
  btnDisabled:        { opacity: 0.5 },
  pokedexLens:        { width: 14, height: 14, borderRadius: 7, backgroundColor: "#5DADE2" },
  pokedexLensInner:   { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFF", margin: 2 },
  hpBarBox:           { marginTop: 1 },
  hpTrackOuter:       { height: 5, backgroundColor: "#444", borderRadius: 3, padding: 0.5 },
  hpTrackInner:       { flex: 1, backgroundColor: "#DDD", overflow: "hidden" },
  hpFill:             { height: "100%" },
  hpNums:             { fontSize: 7, fontFamily: "monospace", textAlign: "right" },
  lcdTitle:           { fontFamily: "monospace", fontWeight: "bold", fontSize: 12, textAlign: "center" },
  warningText:        { fontFamily: "monospace", fontSize: 8, color: "#7B241C", textAlign: "center", fontWeight: "bold" },
  teamPreviewRow:     { flexDirection: "row", gap: 6, justifyContent: "center", flexWrap: "wrap" },
  teamThumb:          { width: 40, height: 40, resizeMode: "contain" },
  startBattleBtn:     { backgroundColor: C.frFight, borderBottomWidth: 4, borderColor: C.frFightDark, borderRadius: 8, paddingHorizontal: 30, paddingVertical: 12, marginTop: 8 },
  startBattleBtnText: { color: "#FFF", fontFamily: "monospace", fontWeight: "bold", fontSize: 14, letterSpacing: 1 },
  internalOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(240, 244, 241, 0.98)", padding: 10, zIndex: 99 },
  swapTitle:          { fontFamily: "monospace", fontWeight: "bold", fontSize: 12, textAlign: "center" },
  swapItemRow:        { flexDirection: "row", alignItems: "center", padding: 6, backgroundColor: "#FFF", borderRadius: 6, marginBottom: 4 },
  swapListSprite:     { width: 32, height: 32, resizeMode: "contain" },
  swapListName:       { fontFamily: "monospace", fontSize: 10, fontWeight: "bold", width: 80 },
  swapListHpCenter:   { flex: 1 },
  backMovesBtn:       { backgroundColor: "#C0392B", padding: 6, borderRadius: 4, alignItems: "center", marginTop: 4 },
  backMovesBtnTxt:    { color: "#FFF", fontFamily: "monospace", fontSize: 9, fontWeight: "bold" },
});