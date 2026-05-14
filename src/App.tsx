import React, { useState, useEffect, useRef } from "react";
import { useLanyard } from "./hooks/useLanyard";
import {
  Eye,
  MapPin,
  Shield,
  Bug,
  Landmark,
  Snowflake,
  Rabbit,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

const DISCORD_ID = "1133035631547793520";

const ArchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <path d="M49.98 12.333c-3.155 10.9-10.021 34.02-23.75 66.834h8.333c5.313-14.938 9.98-28.52 14.522-38.125.103 12.562 10.395 23.333 11.208 24.187H69.17L51.98 44.98c5.48-12.27 10.126-22.958 13.563-31.063C62.666 18.25 58.73 20.313 54.375 22.5L49.98 12.333z" />
  </svg>
);

const DebianRainbowIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="none" className={className}>
    <defs>
      <linearGradient id="rainbow-debian" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FF0018" />
        <stop offset="20%" stopColor="#FFA52C" />
        <stop offset="40%" stopColor="#FFFF41" />
        <stop offset="60%" stopColor="#008018" />
        <stop offset="80%" stopColor="#0000F9" />
        <stop offset="100%" stopColor="#86007D" />
      </linearGradient>
    </defs>
    <path
      stroke="url(#rainbow-debian)"
      strokeWidth="40"
      strokeLinecap="round"
      d="M256 128 C 160 128, 128 180, 128 256 C 128 340, 180 384, 256 384 C 340 384, 384 340, 384 256 C 384 180, 340 128, 256 128 C 200 128, 170 160, 170 210"
    />
    <path
      stroke="url(#rainbow-debian)"
      strokeWidth="40"
      strokeLinecap="round"
      d="M170 210 C 170 260, 210 290, 250 290 C 290 290, 310 250, 310 210 C 310 180, 280 170, 250 170"
    />
    <circle fill="url(#rainbow-debian)" cx="250" cy="170" r="20" />
  </svg>
);

const TsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <defs>
      <linearGradient id="rainbow-ts" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FF0018" />
        <stop offset="20%" stopColor="#FFA52C" />
        <stop offset="40%" stopColor="#FFFF41" />
        <stop offset="60%" stopColor="#008018" />
        <stop offset="80%" stopColor="#0000F9" />
        <stop offset="100%" stopColor="#86007D" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="15" fill="url(#rainbow-ts)" />
    <text
      x="50"
      y="68"
      fill="white"
      fontSize="46"
      fontWeight="bold"
      fontFamily="sans-serif"
      textAnchor="middle"
    >
      TS
    </text>
  </svg>
);

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const xDist = (e.clientX - rect.left) / rect.width;
    const yDist = (e.clientY - rect.top) / rect.height;

    const maxRotation = 12;
    const rotateX = (0.5 - yDist) * maxRotation;
    const rotateY = (xDist - 0.5) * maxRotation;

    setStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      transformStyle: "preserve-3d",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
      transformStyle: "preserve-3d",
    });
  };

  return (
    <div
      ref={cardRef}
      className={`${className} will-change-transform relative`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
          transform: "translateZ(1px)",
        }}
      />
      {children}
    </div>
  );
}

export default function App() {
  const lanyard = useLanyard(DISCORD_ID);
  const [hasEntered, setHasEntered] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [progressData, setProgressData] = useState({
    percent: 0,
    currentStr: "0:00",
    totalStr: "0:00",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!lanyard) return;

    const imageUrls: string[] = [];
    if (lanyard.discord_user?.avatar) {
      imageUrls.push(
        `https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.png?size=256`,
      );
    } else {
      imageUrls.push(
        `https://api.dicebear.com/7.x/identicon/svg?seed=Preston&backgroundColor=111111`,
      );
    }

    if (lanyard.spotify?.album_art_url) {
      imageUrls.push(lanyard.spotify.album_art_url);
    }

    if (imageUrls.length === 0) {
      setIsReady(true);
      return;
    }

    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= imageUrls.length) setIsReady(true);
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.onload = checkDone;
      img.onerror = checkDone;
      img.src = url;
    });
  }, [lanyard]);

  useEffect(() => {
    if (!lanyard?.spotify) return;

    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const interval = setInterval(() => {
      const spotify = lanyard.spotify;
      if (!spotify) return;

      const { start, end } = spotify.timestamps;
      const total = end - start;
      const now = Date.now();
      
      if (total <= 0) return;

      // Ensure current doesn't exceed total
      const current = Math.min(Math.max(now - start, 0), total);
      const percent = (current / total) * 100;

      setProgressData({
        percent: isNaN(percent) ? 0 : percent,
        currentStr: formatTime(current),
        totalStr: formatTime(total),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lanyard?.spotify]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-[#23a559]";
      case "idle":
        return "bg-[#f0b232]";
      case "dnd":
        return "bg-[#f23f43]";
      case "offline":
      default:
        return "bg-[#80848e]";
    }
  };

  const getAvatarUrl = () => {
    if (lanyard?.discord_user) {
      const { id, avatar } = lanyard.discord_user;
      if (avatar)
        return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=256`;
    }
    return `https://api.dicebear.com/7.x/identicon/svg?seed=Preston&backgroundColor=111111`;
  };

  const statusText =
    lanyard?.discord_status === "offline"
      ? "offline"
      : lanyard?.discord_status === "dnd"
        ? "do not disturb"
        : lanyard?.discord_status || "offline";

  const clan = (lanyard?.discord_user as any)?.clan;

  return (
    <div className="min-h-screen bg-[#050505] text-[#fafafa] font-sans antialiased selection:bg-white/20 overflow-hidden relative">
      <div
        className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] transform-gpu blur-0 scale-100 opacity-100"
      >
        <main
          className="w-full max-w-[500px] flex flex-col gap-3 relative"
          style={{ perspective: "1000px" }}
        >
          <TiltCard className="flex flex-col gap-3 w-full">
            <section
              className="bg-[#0f0f0f] border border-white/5 rounded-[16px] px-6 pb-6 pt-0 shadow-[0_8px_30px_rgb(0,0,0,0.5)] mt-16 sm:mt-20"
              style={{ transform: "translateZ(20px)" }}
            >
              <div className="flex justify-between items-start">
                <div className="-mt-10 sm:-mt-12 w-[85px] h-[85px] sm:w-[96px] sm:h-[96px] rounded-[18px] sm:rounded-[22px] overflow-hidden border-[5px] border-[#0f0f0f] bg-[#111] z-10 shrink-0 shadow-lg">
                  <img
                    src={getAvatarUrl()}
                    alt="Preston"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-3 mt-4 text-[11.5px] text-[#888] font-medium tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-[14px] h-[14px] text-[#ccc]" /> 
                    United Kingdom
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-start gap-1">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                  <div className="group relative inline-block">
                    <h1 className="text-[34px] font-sans font-bold tracking-wide text-white mb-0 leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-help">
                      Preston
                    </h1>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#161616] text-[#ddd] text-[11px] px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none z-50 shadow-xl whitespace-nowrap font-mono scale-95 group-hover:scale-100 origin-bottom">
                      UID: {lanyard?.discord_user?.id || DISCORD_ID}
                      <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161616] border-b border-r border-white/10 rotate-45"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#171717] border border-white/5 rounded-full px-2.5 py-1.5 shadow-inner">
                    <BadgeIcon
                      title="HypeSquad Balance"
                      icon={
                        <img
                          src="https://raw.githubusercontent.com/m4rcel-lol/assets/main/liirkwf8yip51.png"
                          alt="HypeSquad Balance Badge"
                          className="brightness-0 invert"
                        />
                      }
                    />
                    <BadgeIcon
                      title="Originally known as prestonstyleza#7062"
                      icon={
                        <img
                          src="https://raw.githubusercontent.com/m4rcel-lol/assets/main/2902-originally-known-as.png"
                          alt="Originally known as prestonstyleza#7062"
                          className="grayscale brightness-[1.5] contrast-125 saturate-0"
                        />
                      }
                    />
                    <BadgeIcon
                      title="Completed a quest"
                      icon={
                        <img
                          src="https://raw.githubusercontent.com/m4rcel-lol/assets/main/66366-completed-a-quest.png"
                          alt="Completed a quest"
                          className="brightness-0 invert"
                        />
                      }
                    />
                    <BadgeIcon
                      title="Last Meadow Online: Level 100 Reached"
                      icon={
                        <img
                          src="https://raw.githubusercontent.com/m4rcel-lol/assets/main/Ca105ad9cfc8580c765101d17bbb2323.webp"
                          alt="Last Meadow Online: Level 100 Reached"
                          className="brightness-0 invert"
                        />
                      }
                    />
                    <BadgeIcon
                      title="Orbs Apprentice"
                      icon={
                        <img
                          src="https://raw.githubusercontent.com/m4rcel-lol/assets/main/OrbsApprentice.webp"
                          alt="Orbs Apprentice"
                          className="grayscale brightness-[1.5] contrast-125 saturate-0"
                        />
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 text-[#b0b0b0] text-[13px] leading-relaxed max-w-[420px]">
                  #Free Palestine<br />
                  ♥️ Charles Marc Hervé Perceval Leclerc<br />
                  Fernando Alonso Especially Renault-2005
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 flex-wrap">
                <SocialIcon
                  href="https://discord.gg/hhtVPxRfeV"
                  icon={<DiscordIcon />}
                />
                <SocialIcon
                  href="https://www.roblox.com/users/1651304800/profile"
                  icon={<RobloxIcon />}
                />
                <SocialIcon
                  href="https://open.spotify.com/user/31j6eqpowt5rzxafange64ti3bwy"
                  icon={<SpotifyIcon className="w-[28px] h-[28px]" />}
                />
                <SocialIcon
                  href="https://www.tiktok.com/@prestonrbx"
                  icon={<TiktokIcon />}
                />
                <SocialIcon
                  href="https://www.twitch.tv/prestonrbx"
                  icon={<TwitchIcon />}
                />
                <SocialIcon
                  href="https://www.youtube.com/channel/UC8IoBrAYmY-ARcJpoula4QQ"
                  icon={<YoutubeIcon />}
                />
                <SocialIcon
                  href="https://www.youtube.com/channel/UCXvH25Qa1oXCyF8edm0r07A"
                  icon={<YoutubeIcon />}
                />
                <SocialIcon
                  href="https://x.com/PrestonRBX"
                  icon={<XIcon />}
                />
              </div>
            </section>

            <section
              className="bg-[#0f0f0f] border border-white/5 rounded-[16px] p-4 flex items-center gap-4 shadow-xl"
              style={{ transform: "translateZ(25px)" }}
            >
              <div className="relative w-[48px] h-[48px] shrink-0">
                <img
                  src={getAvatarUrl()}
                  alt="discord avatar"
                  className="w-full h-full rounded-full object-cover bg-[#1a1a1a] shadow-md"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[3px] border-[#0f0f0f] ${getStatusColor(lanyard?.discord_status)} transition-colors duration-300`}
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0 justify-center">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-sans font-semibold text-[17px] tracking-wide truncate text-white">
                    {lanyard?.discord_user?.username || "prestonstyleza"}
                  </span>
                  {clan?.tag && (
                    <div className="group relative inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[5px] bg-[#1a1a1a] border border-white/5 text-[9px] font-bold tracking-wider text-[#a0a0a0] cursor-help">
                      {clan.badge ? (
                        <img
                          src={`https://cdn.discordapp.com/clan-badges/${clan.identity_guild_id}/${clan.badge}.png`}
                          alt="badge"
                          className="w-[10px] h-[10px] object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement
                              ?.querySelector(".fallback-gem")
                              ?.removeAttribute("hidden");
                          }}
                        />
                      ) : null}
                      <span
                        className="text-[#a855f7] leading-none text-[10px] fallback-gem"
                        hidden={!!clan.badge}
                      >
                        💎
                      </span>
                      {clan.tag}
                    </div>
                  )}
                </div>
                <span className="text-[12px] text-[#777] italic truncate">
                  {lanyard?.activities?.find((a: any) => a.type === 4)?.state ||
                    statusText}
                </span>
              </div>
            </section>

            {lanyard?.spotify && (
              <section
                className="bg-[#0f0f0f] border border-white/5 rounded-[16px] p-4 flex items-center gap-4 shadow-xl"
                style={{ transform: "translateZ(30px)" }}
              >
                <img
                  src={lanyard.spotify.album_art_url}
                  alt="Album Art"
                  className="w-[60px] h-[60px] rounded-[6px] shrink-0 pointer-events-none object-cover shadow-md"
                />

                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="font-semibold text-[14px] text-white truncate w-full">
                    {lanyard.spotify.song} - {lanyard.spotify.artist}
                  </div>

                  <div className="flex items-center gap-[10px] mt-2.5 w-full">
                    <span className="text-[11px] text-[#888] font-mono shrink-0 w-[28px]">
                      {progressData.currentStr}
                    </span>

                    <div className="h-[3px] flex-1 bg-[#222] rounded-full relative shrink-0 overflow-hidden shadow-inner flex items-center">
                      <div
                        className="absolute top-0 left-0 h-full bg-[#eee] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                        style={{ width: `${progressData.percent}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full transition-all duration-[1000ms] ease-linear"
                        style={{ left: `calc(${progressData.percent}% - 3px)` }}
                      />
                    </div>

                    <span className="text-[11px] text-[#888] font-mono shrink-0 w-[28px] text-right">
                      {progressData.totalStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center pl-2 pr-1">
                  <a
                    href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Listen on Spotify"
                    className="text-white hover:text-[#1db954] opacity-80 hover:opacity-100 hover:scale-110 transition-all flex items-center justify-center p-2"
                  >
                    <SpotifyIcon />
                  </a>
                </div>
              </section>
            )}
          </TiltCard>
          
          {/* Akkoma verification */}
          <a href="https://social.european-commission-europa.eu" rel="me" className="hidden">Find me on my Social</a>
        </main>
      </div>
    </div>
  );
}

function BadgeIcon({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="group relative inline-flex items-center justify-center pointer-events-auto">
      <div className="text-white hover:scale-110 transition-transform duration-300 cursor-help p-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
        {React.cloneElement(icon as React.ReactElement, {
          className: `w-5 h-5 ${(icon as React.ReactElement).props.className || ""}`,
        })}
      </div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#161616] text-[#ddd] text-[11px] px-2.5 py-1.5 rounded-lg border border-white/10 pointer-events-none z-50 shadow-xl whitespace-nowrap font-medium scale-95 group-hover:scale-100 origin-bottom">
        {title}
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161616] border-b border-r border-white/10 rotate-45"></div>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="me noopener noreferrer"
      className="text-white icon-glow opacity-90 hover:opacity-100 hover:scale-110 transition-all flex items-center justify-center"
    >
      {icon}
    </a>
  );
}

const DiscordIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const GithubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[34px] h-[34px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2.5 7.5A3.5 3.5 0 0 1 6 4h12a3.5 3.5 0 0 1 3.5 3.5v9A3.5 3.5 0 0 1 18 20H6a3.5 3.5 0 0 1-3.5-3.5v-9zm3.5-1.5h12c.321 0 .622.091.874.249l-6.52 4.492a.601.601 0 0 1-.699 0L4.126 6.25A1.503 1.503 0 0 1 6 6zM4 16.5c0 .354.103.684.28 1.024A2.001 2.001 0 0 0 6 18h12a2 2 0 0 0 1.72-.976q.28-.465.28-1.024v-8.219l-7.447 5.132a2.102 2.102 0 0 1-2.457 0L4 7.78V16.5z" />
  </svg>
);

const TelegramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[30px] h-[30px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.92 1.23-5.44 3.6-.51.35-.97.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.5.15.11.1.15.24.16.35-.01.07 0 .23 0 .37z" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[28px] h-[28px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className || "w-[20px] h-[20px]"}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-2.22c-.302.48-.9.66-1.38.36-3.24-2.04-8.16-2.64-11.94-1.44-.54.18-1.08-.12-1.26-.66-.18-.54.12-1.08.66-1.26 4.32-1.38 9.72-.66 13.56 1.62.48.3.66.9.36 1.38zm.12-2.4c-3.9-2.28-10.26-2.52-14.04-1.38-.66.18-1.32-.18-1.5-.84-.18-.66.18-1.32.84-1.5 4.38-1.32 11.28-1.02 15.78 1.62.6.36.78 1.08.42 1.68-.36.6-1.08.78-1.68.42z" />
  </svg>
);

const RobloxIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    className="w-[28px] h-[28px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Roblox</title>
    <path d="m13.383 14.341-3.726-.958.959-3.726 3.726.959-.96 3.726zM4.913 0 0 19.088 19.088 24 24 4.912 4.912 0z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[26px] h-[26px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.2-5.02 1.77-6.95 1.54-1.87 3.9-3 6.36-2.92v4.06c-1.3.06-2.56.66-3.41 1.62-.57.65-.96 1.45-1.07 2.33-.14 1.25.13 2.52.88 3.5 1.07 1.34 2.82 2.01 4.5 1.76 1.12-.17 2.15-.79 2.84-1.67.62-.83.94-1.86.95-2.9 0-4.87-.04-9.74.02-14.61z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[28px] h-[28px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.806-6.806v-14.149h-21.851zm19.164 13.104l-4.299 4.299h-4.657l-3.045 3.045v-3.045h-4.836v-15.045h16.836v10.746zm-5.373-6.269v6.09h-1.97v-6.09h1.97zm-4.657 0v6.09h-1.97v-6.09h1.97z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-[28px] h-[28px]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
