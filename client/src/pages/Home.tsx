import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Copy,
  FileCode2,
  Gamepad2,
  Globe2,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MoreHorizontal,
  MousePointerClick,
  Palette,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pages", label: "Landing Pages", icon: FileCode2, count: "03" },
  { id: "pixels", label: "Tracking Pixels", icon: Target, count: "04" },
  { id: "team", label: "ทีมงาน", icon: Users },
];

const seedPages = [
  {
    id: "sale",
    name: "หน้าขายของหลัก",
    slug: "/go/shop-main",
    type: "Selling",
    status: "Live",
    views: "24,891",
    clicks: "8,421",
    accent: "lime",
    description: "สำหรับลูกค้าจริง · แสดงสินค้าและช่องทางติดต่อ",
  },
  {
    id: "game",
    name: "Game / SEO layer",
    slug: "/go/game-seo",
    type: "Game + SEO",
    status: "Live",
    views: "18,204",
    clicks: "6,210",
    accent: "lilac",
    description: "สำหรับ crawler · เกม, quiz และ meta ที่อ่านง่าย",
  },
  {
    id: "flash",
    name: "Flash sale 10.10",
    slug: "/go/flash-1010",
    type: "Selling",
    status: "Draft",
    views: "—",
    clicks: "—",
    accent: "peach",
    description: "แคมเปญใหม่ · รอเชื่อม Pixel ก่อนเผยแพร่",
  },
];

const baseIntegrations = [
  { name: "Meta Pixel", sub: "Facebook / Instagram", value: "•••• 8192", status: "Connected", tone: "meta" },
  { name: "TikTok Pixel", sub: "TikTok Ads", value: "•••• 4A8F", status: "Connected", tone: "tiktok" },
  { name: "Conversion API", sub: "Server-side events", value: "••••••••", status: "Needs review", tone: "api" },
];

const activities = [
  { icon: Check, title: "เผยแพร่หน้าขายของหลัก", meta: "เมื่อ 12 นาทีที่แล้ว · โดย Narin", color: "green" },
  { icon: Code2, title: "แก้ไข Custom CSS", meta: "เมื่อ 38 นาทีที่แล้ว · Game / SEO layer", color: "purple" },
  { icon: Target, title: "เชื่อม TikTok Pixel สำเร็จ", meta: "เมื่อ 1 ชั่วโมงที่แล้ว · Flash sale 10.10", color: "orange" },
];

function MiniWindow({ mode }: { mode: "bot" | "human" }) {
  if (mode === "bot") {
    return (
      <div className="mini-window mini-window-bot">
        <div className="window-toolbar"><span /><span /><span /><small>BOT VIEW</small></div>
        <div className="bot-preview-content">
          <div className="game-orb"><Gamepad2 size={20} /></div>
          <b>GAME ONLINE ★</b>
          <em>Play · Quiz · Tool · Article</em>
          <div className="bot-lines"><i /><i /><i /></div>
        </div>
      </div>
    );
  }
  return (
    <div className="mini-window mini-window-human">
      <div className="window-toolbar"><span /><span /><span /><small>HUMAN VIEW</small></div>
      <div className="human-preview-content">
        <div className="store-avatar"><Store size={18} /></div>
        <b>ร้านของคุณ</b>
        <small>สินค้าคัดมาให้แล้ว · พร้อมส่ง</small>
        <div className="product-strip"><span /><span /><span /></div>
        <div className="human-button">ช้อปเลย <ArrowUpRight size={12} /></div>
      </div>
    </div>
  );
}

export default function Home() {
  const auth = useAuth();
  const pagesQuery = trpc.pages.list.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const pageMutation = trpc.pages.upsert.useMutation({ onSuccess: () => pagesQuery.refetch() });
  const pixelMutation = trpc.tracking.savePixel.useMutation({ onSuccess: () => toast.success("บันทึก Pixel ถาวรแล้ว") });
  const settingsMutation = trpc.settings.save.useMutation({ onSuccess: () => { toast.success("บันทึกการตั้งค่า server-side แล้ว"); setModal(null); } });
  const [activeNav, setActiveNav] = useState("overview");
  const [activePage, setActivePage] = useState("sale");
  const [previewMode, setPreviewMode] = useState<"bot" | "human">("human");
  const [integrations, setIntegrations] = useState(baseIntegrations);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<"css" | "pixel" | "team" | "settings" | null>(null);
  const [cssValue, setCssValue] = useState(".hero-title { letter-spacing: -0.04em; }\n.cta-primary { border-radius: 14px; }");
  const [pixelProvider, setPixelProvider] = useState<"meta" | "tiktok" | "line">("meta");
  const [pixelValue, setPixelValue] = useState("");
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [lineTagId, setLineTagId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [tiktokApiToken, setTiktokApiToken] = useState("");
  const [newMember, setNewMember] = useState("");
  const [members, setMembers] = useState(["Narin S.", "May P.", "Tee K."]);

  const pages = useMemo(() => pagesQuery.data?.map((page) => ({
    id: String(page.id),
    name: page.name,
    slug: `/go/${page.slug}`,
    type: page.type === "selling" ? "Selling" : page.type === "game" ? "Game + SEO" : "SEO",
    status: page.status[0].toUpperCase() + page.status.slice(1),
    views: "—",
    clicks: "—",
    accent: page.type === "selling" ? "lime" : page.type === "game" ? "lilac" : "peach",
    description: page.description || "Landing Page จากฐานข้อมูลจริง",
  })) ?? seedPages, [pagesQuery.data]);
  const selectedRawPage = pagesQuery.data?.find((page) => String(page.id) === activePage);
  const selectedPage = useMemo(() => pages.find((page) => page.id === activePage) ?? pages[0], [activePage, pages]);
  const displayName = auth.user?.name || "Narin S.";

  const goTo = (id: string) => {
    setActiveNav(id);
    setMobileOpen(false);
    if (id !== "overview") {
      window.setTimeout(() => document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const login = () => {
    try {
      startLogin();
    } catch {
      toast.error("ยังไม่ได้ตั้งค่า Manus OAuth ใน environment นี้");
    }
  };

  const toggleIntegration = (name: string) => {
    setIntegrations((items) => items.map((item) => item.name === name ? { ...item, status: item.status === "Connected" ? "Needs review" : "Connected" } : item));
    toast.success(`${name} อัปเดตสถานะแล้ว`);
  };

  const savePage = () => {
    if (!selectedRawPage || !auth.user) {
      toast.info("เข้าสู่ระบบและเลือกหน้าในฐานข้อมูลก่อนบันทึก");
      return;
    }
    pageMutation.mutate({ id: selectedRawPage.id, name: selectedRawPage.name, slug: selectedRawPage.slug, type: selectedRawPage.type, status: selectedRawPage.status, title: selectedRawPage.title, description: selectedRawPage.description ?? undefined, contentJson: JSON.stringify(selectedRawPage.content), customCss: cssValue });
    setModal(null);
  };

  const savePixel = () => {
    if (!selectedRawPage || !pixelValue.trim()) {
      toast.error("กรุณาเลือกหน้าและกรอกรหัส Pixel");
      return;
    }
    pixelMutation.mutate({ landingPageId: selectedRawPage.id, provider: pixelProvider, pixelId: pixelValue.trim(), enabled: true });
    setModal(null);
    setPixelValue("");
  };

  const addMember = () => {
    const clean = newMember.trim();
    if (!clean) return;
    setMembers((current) => [...current, clean]);
    setNewMember("");
    toast.success(`เพิ่ม ${clean} ในทีมแล้ว`);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span /><span /></div>
          <div><strong>ADSHUB</strong><small>CONTROL ROOM</small></div>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-dot" />
          <div><small>WORKSPACE</small><b>XLINKX / STORE</b></div>
          <ChevronDown size={15} />
        </div>
        <nav className="main-nav" aria-label="เมนูหลัก">
          <p className="nav-kicker">จัดการระบบ</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => goTo(item.id)}><Icon size={17} /><span>{item.label}</span>{item.count && <small>{item.count}</small>}</button>;
          })}
          <p className="nav-kicker nav-kicker-space">ตั้งค่า</p>
          <button className={`nav-item ${activeNav === "settings" ? "active" : ""}`} onClick={() => goTo("settings")}><Settings2 size={17} /><span>Workspace settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><CircleHelp size={17} /><div><b>ต้องการความช่วยเหลือ?</b><small>คู่มือการใช้งาน AdsHub</small></div><ArrowUpRight size={14} /></div>
          <div className="user-card"><div className="avatar">NS</div><div><b>{displayName}</b><small>Admin access</small></div><MoreHorizontal size={16} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen((open) => !open)} aria-label="เปิดเมนู"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeNav === "overview" ? "Overview" : navItems.find((item) => item.id === activeNav)?.label || "Settings"}</strong></div>
          <div className="topbar-actions">
            <div className="status-chip"><span /> ระบบทำงานปกติ</div>
            <button className="icon-button" aria-label="แจ้งเตือน"><Bell size={17} /><i /></button>
            {auth.isAuthenticated ? <button className="profile-button" onClick={() => auth.logout()} title="ออกจากระบบ"><div className="avatar avatar-small">NS</div><LogOut size={15} /></button> : <button className="login-button" onClick={login}>เข้าสู่ระบบ <ArrowUpRight size={15} /></button>}
          </div>
        </header>

        <div className="content-canvas">
          <section className="hero-section" id="overview">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> ADS OPERATIONS / 26 OCT 2026</div>
              <h1>สลับหน้าให้แคมเปญ<br /><span>ไปถึงคนที่ใช่</span></h1>
              <p>จัดการหน้าเกม, หน้า SEO และหน้าขายของในที่เดียว ตั้ง tracking แล้วดูผลลัพธ์แบบไม่ต้องเปิดหลายเครื่องมือ</p>
              <div className="hero-actions"><button className="primary-button" onClick={() => setModal("css")}><Plus size={17} /> สร้าง Landing Page</button><button className="text-button" onClick={() => setPreviewMode(previewMode === "human" ? "bot" : "human")}><Globe2 size={16} /> ดู Preview {previewMode === "human" ? "Bot" : "คนจริง"}</button></div>
              <div className="hero-proof"><div className="proof-avatars"><span>NS</span><span>MP</span><span>TK</span><b>+4</b></div><span>ทีมกำลังทำงานบน workspace นี้</span></div>
            </div>
            <div className="hero-switchboard">
              <div className="switchboard-head"><div><span className="section-label">ACTIVE ROUTING</span><h2>ตอนนี้กำลังแสดง</h2></div><span className="live-badge"><i /> LIVE</span></div>
              <div className="mode-tabs"><button className={previewMode === "human" ? "selected" : ""} onClick={() => setPreviewMode("human")}><Store size={15} /> หน้าขายของ</button><button className={previewMode === "bot" ? "selected" : ""} onClick={() => setPreviewMode("bot")}><Bot size={15} /> หน้าเกม / SEO</button></div>
              <div className="switchboard-preview"><div className="preview-label"><span>{previewMode === "human" ? "REAL VISITOR" : "CRAWLER / BOT"}</span><span className="preview-url">xlinkx.xyz/go/{previewMode === "human" ? "shop-main" : "game-seo"}</span></div><MiniWindow mode={previewMode} /></div>
              <div className="switchboard-foot"><span><Zap size={14} /> Auto-routing เปิดอยู่</span><button onClick={() => setModal("css")}>แก้ไข routing <ArrowUpRight size={14} /></button></div>
            </div>
          </section>

          <section className="metrics-grid" aria-label="สถิติรวม">
            <div className="metric-card metric-lime"><div className="metric-top"><span>VISITORS</span><MousePointerClick size={16} /></div><strong>341,892</strong><small><b>+18.6%</b> จากสัปดาห์ก่อน</small><div className="sparkline lime-line"><i /><i /><i /><i /><i /><i /><i /></div></div>
            <div className="metric-card"><div className="metric-top"><span>ACTIVE PAGES</span><FileCode2 size={16} /></div><strong>03 <small>/ 05</small></strong><small><b className="dark-text">2 pages</b> มี draft อยู่</small><div className="progress-track"><i style={{ width: "60%" }} /></div></div>
            <div className="metric-card"><div className="metric-top"><span>TOTAL CLICKS</span><Link2 size={16} /></div><strong>59,168</strong><small><b>+7.2%</b> จากสัปดาห์ก่อน</small><div className="sparkline purple-line"><i /><i /><i /><i /><i /><i /><i /></div></div>
            <div className="metric-card"><div className="metric-top"><span>CONVERSION RATE</span><BarChart3 size={16} /></div><strong>6.84<small>%</small></strong><small><b>+1.4%</b> vs. last 7 days</small><div className="conversion-ring"><span>6.84%</span></div></div>
          </section>

          <section className="section-block page-management" id="pages-section">
            <div className="section-heading"><div><span className="section-label">YOUR LANDING PAGES</span><h2>หน้า Landing Page ทั้งหมด</h2><p>เลือกหน้าเพื่อแก้ไข ดูสถิติ หรือเปลี่ยน routing ของแคมเปญ</p></div><div className="heading-actions"><button className="ghost-button"><Copy size={15} /> Duplicate</button><button className="black-button" onClick={() => setModal("css")}><Plus size={15} /> สร้างหน้าใหม่</button></div></div>
            <div className="page-table">
              <div className="table-head"><span>PAGE</span><span>TYPE</span><span>STATUS</span><span>VIEWS / CLICKS</span><span /></div>
              {pages.map((page) => <button key={page.id} className={`page-row ${activePage === page.id ? "row-active" : ""}`} onClick={() => { setActivePage(page.id); toast.success(`เลือก ${page.name} แล้ว`); }}><div className="page-name"><div className={`page-icon page-icon-${page.accent}`}>{page.type === "Selling" ? <Store size={17} /> : page.type === "Game + SEO" ? <Gamepad2 size={17} /> : <Sparkles size={17} />}</div><div><b>{page.name}</b><small>{page.slug} · {page.description}</small></div></div><span className="type-pill">{page.type}</span><span className={`status-pill status-${page.status.toLowerCase()}`}><i /> {page.status}</span><span className="page-stats"><b>{page.views}</b><small>{page.clicks} clicks</small></span><MoreHorizontal size={17} className="row-more" /></button>)}
            </div>
          </section>

          <section className="split-grid">
            <div className="section-block routing-card" id="pixels-section">
              <div className="section-heading compact"><div><span className="section-label">SMART ROUTING</span><h2>คนจริงเห็นแบบหนึ่ง<br />Bot เห็นอีกแบบ</h2></div><button className="icon-button plain"><MoreHorizontal size={17} /></button></div>
              <p className="section-description">หนึ่งลิงก์สำหรับทุกช่องทาง ระบบแยกเส้นทางอัตโนมัติ และไม่นับ crawler รวมกับสถิติคนจริง</p>
              <div className="compare-stage"><div className={`compare-card ${previewMode === "bot" ? "compare-selected" : ""}`} onClick={() => setPreviewMode("bot")}><div className="compare-card-head"><span className="compare-icon bot-icon"><Bot size={16} /></span><b>Bot / SEO</b><span className="tag">CRAWLER</span></div><div className="compare-thumb"><MiniWindow mode="bot" /></div><ul><li><Check size={13} /> Full meta / OG tags</li><li><Check size={13} /> เนื้อหาเกมและ quiz</li></ul></div><div className="vs-badge">VS</div><div className={`compare-card ${previewMode === "human" ? "compare-selected" : ""}`} onClick={() => setPreviewMode("human")}><div className="compare-card-head"><span className="compare-icon human-icon"><Store size={16} /></span><b>ลูกค้าจริง</b><span className="tag tag-lime">SHOP</span></div><div className="compare-thumb"><MiniWindow mode="human" /></div><ul><li><Check size={13} /> Tracking ยิงครบทุก event</li><li><Check size={13} /> เชื่อมสินค้าและช่องทางขาย</li></ul></div></div>
              <button className="wide-outline-button" onClick={() => setPreviewMode(previewMode === "human" ? "bot" : "human")}>สลับ Preview <ArrowUpRight size={15} /></button>
            </div>

            <div className="section-block integrations-card">
              <div className="section-heading compact"><div><span className="section-label">TRACKING CENTER</span><h2>ติดตามทุกคลิก<br />จากที่เดียว</h2></div><button className="black-circle-button" onClick={() => setModal("pixel")}><Plus size={16} /></button></div>
              <p className="section-description">ตั้งค่าตามหน้าได้ทั้ง browser pixel และ server-side API ค่าลับจะไม่แสดงในหน้า public</p>
              <div className="integration-list">{integrations.map((integration) => <div className="integration-row" key={integration.name}><span className={`integration-logo ${integration.tone}`}>{integration.tone === "meta" ? "f" : integration.tone === "tiktok" ? "♪" : "↗"}</span><div className="integration-info"><b>{integration.name}</b><small>{integration.sub} · {integration.value}</small></div><button className={`integration-status ${integration.status === "Connected" ? "connected" : "review"}`} onClick={() => toggleIntegration(integration.name)}><i /> {integration.status}</button><MoreHorizontal size={15} /></div>)}</div>
              <button className="wide-outline-button" onClick={() => setModal("pixel")}>จัดการ integrations <ArrowUpRight size={15} /></button>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="section-block activity-card"><div className="section-heading compact"><div><span className="section-label">RECENT ACTIVITY</span><h2>กิจกรรมล่าสุด</h2></div><button className="text-button">ดูทั้งหมด <ArrowUpRight size={14} /></button></div><div className="activity-list">{activities.map((item) => { const Icon = item.icon; return <div className="activity-row" key={item.title}><span className={`activity-icon ${item.color}`}><Icon size={14} /></span><div><b>{item.title}</b><small>{item.meta}</small></div><MoreHorizontal size={15} /></div>; })}</div></div>
            <div className="section-block health-card"><div className="health-stamp"><ShieldCheck size={20} /></div><span className="section-label">WORKSPACE HEALTH</span><h2>พร้อมสำหรับ<br /><span>แคมเปญถัดไป</span></h2><p>ทุกหน้าออนไลน์และ tracking ทำงานตามปกติ ไม่มี action ที่ต้องทำตอนนี้</p><div className="health-bars"><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="health-foot"><b><i /> 99.98% uptime</b><small>อัปเดตเมื่อ 2 นาทีที่แล้ว</small></div></div>
          </section>

          <section className="section-block team-section" id="team-section"><div className="section-heading"><div><span className="section-label">TEAM ACCESS</span><h2>ทีมที่ดูแล workspace นี้</h2><p>กำหนดสิทธิ์การเข้าถึง editor, pixel และสถิติ</p></div><button className="black-button" onClick={() => setModal("team")}><Plus size={15} /> เพิ่มสมาชิก</button></div><div className="team-list">{members.map((member, index) => <div className="team-row" key={member}><div className="avatar">{member.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><b>{member}</b><small>{index === 0 ? "เจ้าของ workspace" : "Editor · Tracking"}</small></div><span className="team-access">{index === 0 ? "Owner" : "Editor"}</span><MoreHorizontal size={16} /></div>)}</div></section>
          <button id="settings-section" className="settings-anchor" onClick={() => setModal("settings")}><Code2 size={16} /> ตั้งค่า Pixel, TikTok API และ Custom CSS <ArrowUpRight size={14} /></button>
          <footer className="footer-note"><span>ADSHUB / INTERNAL CONTROL ROOM</span><span>Privacy first · Built for focused campaigns</span></footer>
        </div>
      </main>

      {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal-card" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}><X size={17} /></button>{modal === "css" && <><span className="section-label">PAGE EDITOR</span><h2>แก้ไข {selectedPage.name}</h2><p className="modal-copy">ปรับ custom CSS และเลือกหน้า routing ที่ต้องการใช้ ระบบจะ preview ก่อนเผยแพร่จริง</p><label>Custom CSS<textarea value={cssValue} onChange={(event) => setCssValue(event.target.value)} /></label><div className="modal-row"><button className="ghost-button" onClick={() => setModal(null)}>ยกเลิก</button><button className="black-button" onClick={savePage}>บันทึกแบบร่าง <Check size={15} /></button></div></>}{modal === "pixel" && <><span className="section-label">TRACKING CENTER</span><h2>เชื่อมต่อ Pixel</h2><p className="modal-copy">ตั้งค่ารหัสสำหรับ {selectedPage.name} แยกได้จากหน้าอื่น</p><label>Platform<select value={pixelProvider} onChange={(event) => setPixelProvider(event.target.value as "meta" | "tiktok" | "line")}><option value="meta">Meta Pixel</option><option value="tiktok">TikTok Pixel</option><option value="line">LINE tag</option></select></label><label>Pixel ID / Tag ID<input value={pixelValue} onChange={(event) => setPixelValue(event.target.value)} placeholder="วางรหัสในช่องนี้" /></label><div className="warning-note"><ShieldCheck size={16} /> ค่าลับจะถูกเก็บฝั่ง server และไม่ถูกแสดงใน public page</div><div className="modal-row"><button className="ghost-button" onClick={() => setModal(null)}>ยกเลิก</button><button className="black-button" onClick={savePixel}>เชื่อมต่อ <ArrowUpRight size={15} /></button></div></>}{modal === "team" && <><span className="section-label">TEAM ACCESS</span><h2>เพิ่มสมาชิกทีม</h2><p className="modal-copy">ส่งคำเชิญให้ทีมเข้ามาช่วยแก้ไขหน้าและดูสถิติ</p><label>ชื่อหรืออีเมล<input value={newMember} onChange={(event) => setNewMember(event.target.value)} placeholder="เช่น pat@company.com" /></label><label>สิทธิ์<select defaultValue="Editor"><option>Editor</option><option>Analyst</option><option>Admin</option></select></label><div className="modal-row"><button className="ghost-button" onClick={() => setModal(null)}>ยกเลิก</button><button className="black-button" onClick={() => { addMember(); setModal(null); }}>เพิ่มสมาชิก <Plus size={15} /></button></div></>}{modal === "settings" && <><span className="section-label">WORKSPACE SETTINGS</span><h2>Pixel, API และ Custom CSS</h2><p className="modal-copy">ค่าที่กรอกจะถูกเก็บฝั่ง server และ token จะไม่ถูกส่งกลับไปที่หน้า public</p><label>รหัสพิกเซลของ Facebook<input value={facebookPixelId} onChange={(event) => setFacebookPixelId(event.target.value)} placeholder="Facebook Pixel ID" /></label><label>แท็ก LINE / รหัสพิกเซล<input value={lineTagId} onChange={(event) => setLineTagId(event.target.value)} placeholder="LINE tag ID" /></label><label>รหัสพิกเซลของ TikTok<input value={tiktokPixelId} onChange={(event) => setTiktokPixelId(event.target.value)} placeholder="TikTok Pixel ID" /></label><label>การเข้าถึง API สำหรับกิจกรรม TikTok / โทเค็น<input type="password" value={tiktokApiToken} onChange={(event) => setTiktokApiToken(event.target.value)} placeholder="วาง token เฉพาะฝั่ง server" /></label><label>Custom CSS<textarea value={cssValue} onChange={(event) => setCssValue(event.target.value)} /></label><div className="modal-row"><button className="ghost-button" onClick={() => setModal(null)}>ยกเลิก</button><button className="black-button" onClick={() => settingsMutation.mutate({ facebookPixelId, lineTagId, tiktokPixelId, tiktokApiToken, customCss: cssValue })}>บันทึก Settings <Check size={15} /></button></div></>}{/* end settings */}</div></div>}
    </div>
  );
}
