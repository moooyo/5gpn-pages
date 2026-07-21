# Handoff: 5gpn-pages — iOS / Apple 风格统一改版

## Overview
将 **moooyo/5gpn-pages**（5GPN 直出型智能分流 DNS/SNI 网关的营销站）重做为与 **moooyo/5gpn-relay** 完全一致的 Apple 产品页设计语言：系统字体、off-white/near-black 中性色、单一靛蓝 accent、胶囊按钮、浮动示意卡、深色终端与页脚、浅色/深色主题切换。

内容更新（相对旧站）：
- Xray-core 全部替换为 **mihomo**
- **不再有广告拦截**（adblock 规则、NXDOMAIN 分支已全部移除；规则为"三类"）
- 原理部分为 **4 步**：接入 / 判定 / 直连 / 出站
- 顶部导航新增 **方案切换分段控件**：`DNS 网关（当前） | Apple Relay ↗`，Apple Relay 的链接 **留空待补**（`href=""`）

## About the Design Files
本包中的 `5GPN Pages iOS Redesign.dc.html` 是 **HTML 设计稿/原型**，展示目标外观与交互，**不是可直接上线的生产代码**。任务是在目标代码库中**重新实现**：5gpn-pages 是零构建的纯静态站（`index.html` + `styles.css` + `main.js`，GitHub Pages 部署），请按该结构产出，CSS 组织方式建议直接对齐 5gpn-relay 的 `web/assets/styles.css`（tokens + 组件类 + 强制主题属性），最大化两站代码一致性。

## Fidelity
**High-fidelity**。颜色、字号、间距、圆角、阴影均为最终值，按下文精确还原。

## Design Tokens

字体：
- Sans: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- Mono: `ui-monospace, 'SF Mono', Menlo, monospace`

固定色（不随主题变化）：
- accent（靛蓝）`#5e5ce6`；accentSoft `rgba(94,92,230,.10)`（即 `#5e5ce61a`）；accentGlow `#5e5ce62e`
- blue（CTA）`#0071e3`，hover `#0077ed`
- green `#34c759`（tag 深绿 `#248a3d`）；orange `#ff9f0a`
- 终端/页脚永远深色：bg `#1d1d1f`，bar `#2a2a2c`，文字 `#e8e8ed`，注释 `#8a8a8e`，prompt `#5ac8fa`，URL `#a78bfa`，红绿灯 `#ff5f56 #ffbd2e #27c93f`

主题变量（浅色 / 深色）：
- `--bg` `#fbfbfd` / `#0a0a0c`
- `--surface` `#f5f5f7` / `#141416`
- `--card` `#ffffff` / `#1c1c1f`
- `--ink` `#1d1d1f` / `#f5f5f7`
- `--muted` `#6e6e73` / `#a1a1a6`
- `--faint` `#86868b` / `#8a8a8e`
- `--border` `rgba(0,0,0,.08)` / `rgba(255,255,255,.12)`
- `--border2` `rgba(0,0,0,.06)` / `rgba(255,255,255,.08)`
- `--hairline` `rgba(0,0,0,.07)` / `rgba(255,255,255,.1)`
- `--strokeIn` `rgba(0,0,0,.16)` / `rgba(255,255,255,.2)`
- `--heroWash` `#f0f0ff` / `#17171f`
- `--navbg` `rgba(251,251,253,.82)` / `rgba(16,16,18,.72)`

主题机制（照抄 5gpn-relay）：默认浅色；`:root[data-theme="dark"]` 强制深色；建议同样支持 `prefers-color-scheme` 自动模式 + `localStorage('5gpn-theme')` 首帧防闪。

其他 token：
- 内容最大宽 `1120px`；section 内边距 `clamp(60px, 9vw, 100px) 24px`
- 圆角：胶囊 `980px`，大卡 `22–24px`，卡片 `18–20px`，终端 `16px`，图标块/步骤徽章 `11px`，code chip `6px`
- 链接默认 `a { color:#0071e3 }`，hover `#0077ed`；`::selection` `rgba(94,92,230,.2)`；`html { scroll-behavior:smooth }`；锚点区块 `scroll-margin-top:60px`

## Screens / Views（自上而下）

### 1. Nav（sticky）
- `position:sticky; top:0; z-index:50; background:var(--navbg); backdrop-filter:saturate(180%) blur(20px); border-bottom:1px solid var(--hairline)`；内层 1120px 居中，高 `64px`，`padding:0 28px`，两端对齐
- 左组（gap 18px）：
  - 品牌：9px 靛蓝圆点（`box-shadow:0 0 0 3px accentSoft`）+ "5GPN"（19px/600/-0.01em，`--ink`）
  - **方案分段控件**：容器 `background:var(--surface); border:1px solid var(--border2); border-radius:980px; padding:3px; gap:2px`
    - 选中段 "DNS 网关"：`min-height:28px; padding:0 14px; border-radius:980px; background:var(--card); color:var(--ink); font-size:12.5px; font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,.08)`
    - 未选段 "Apple Relay ↗"：同尺寸，`color:var(--muted)` hover `--ink`，**`href=""` 留空待补**，`title="切换到 Apple Relay 方案"`
- 右组（gap 10px）：
  - 外链 "KFCHost ↗"（`https://kfchost.com/center/dashboard?aff=AFF112062USFL`）与 "GitHub ↗"（`https://github.com/moooyo/5gpn`）：14px，`color:var(--muted)` hover `--ink`，↗ 为 12px、opacity .65
  - 主题按钮：胶囊，`min-height:36px; padding:0 12px; border:1px solid var(--border); background:var(--card); font-size:13px`，内容 `◐ 浅色/深色`，hover `border-color:var(--strokeIn); background:var(--surface)`，active `scale(.97)`
  - 主 CTA "安装网关" → `#install`：蓝色胶囊 `min-height:36px; padding:0 18px; background:#0071e3; color:#fff; font-weight:600; box-shadow:0 4px 12px rgba(0,113,227,.2)`，hover `#0077ed` + `translateY(-1px)`

### 2. Hero（id top）
- 居中，`padding: clamp(60px,10vw,96px) 24px 40px`，背景 `radial-gradient(120% 90% at 50% 0%, var(--heroWash) 0%, var(--bg) 58%)`
- eyebrow "开源 · MIT · 一个 Go 二进制"：14px/600，accent，margin-bottom 20px
- H1 "解析即**策略**。"（"策略"为 accent 色）：`clamp(38px, 8.5vw, 78px); line-height:1.04; letter-spacing:-.035em; font-weight:700`
- lede（max-width 660px，`--muted`，`clamp(17px,2.6vw,22px)`）："直出型智能分流 DNS / SNI 网关。一次解析决定每条流量**直连**还是**走网关**——客户端只需填一个 DoT 域名，无需安装任何 App。"（加粗词用 `--ink`/600）
- CTA 行：蓝胶囊 "一行命令安装 →"（padding 15px 30px，17px）→ `#install`；文字链 "看它怎么工作 ›" → `#how`
- 依赖说明（14px `--muted`）："需配合 KFCHost 与 **5GPN 订阅包** 使用"（KFCHost 为链接）
- 4 个 chips（胶囊：13.5px，`--muted`，`--card` 底 + `--border` 边，padding 8px 15px；前置 6px 圆点）：
  - 无需客户端 App（绿点）· DoT-only 接入（靛点）· 一个进程 · 一个配置文件（靛点）· 直出 · 无隧道（橙点）

### 3. 分流示意卡
- 白卡：max-width 860px，radius 24px，border `--border`，`box-shadow:0 20px 60px var(--hairline)`，浮动动画 `floaty 7s ease-in-out infinite`（translateY 0→-7px→0）
- 内嵌 SVG `viewBox="0 0 820 320"`（设计稿含精确坐标，可直接抄）。节点（rx 14 圆角矩形，fill `--card`）：
  - 任意设备（30,130 92×84，stroke `--strokeIn`）「任意设备 / 无需 App」
  - **5gpn-dns**（170,140 110×64，fill `--heroWash`，stroke accent）「5gpn-dns（mono 700）/ 解析 · 判定」，上方 mono 标签 accent 色 `DoT :853`
  - 直连目标（470,44 200×76，stroke green）「直连目标 / 真实 IP · 客户端直连（绿）」
  - **mihomo**（340,230 120×62，stroke accent）「mihomo（mono 700）/ 透明转发」
  - 多出口（520,230 130×62）「多出口 / selector 切换」
  - 世界（700,225 92×72）「世界 / INTERNET」
- 连线（2–2.5px，opacity .45–.7）：设备→5gpn-dns（灰）；5gpn-dns→直连目标（绿曲线）；5gpn-dns→mihomo（靛曲线）；mihomo→多出口（**橙色虚线** dasharray 6 5，上方橙色 mono 标签"出站"）；多出口→世界（靛）
- 动画数据包：r=4.5 圆点沿路径循环（`animateMotion`）——绿路 2 枚（dur 2.8s，错相 1.4s），靛路 3 枚（dur 4.6s，错相 ~1.5s）

### 4. 安装（id install，`--bg` 底）
- 居中标题组（下文各 section 同构）：eyebrow（14px/600 accent）"安装 · 网关侧"；H2（`clamp(28px,4.6vw,44px)/1.1/-.02em/700`）"一行命令，装好网关"；sub（17px `--muted`）"在一台 root 权限的 Linux 网关上执行。交互式问答（WebUI 域名 / DoT 域名 / 网关 IP），自动签发证书、拉起 systemd 服务。"
- 深色终端（max-width 840px）：bar 含三个 12px 红绿灯 + mono 标签 `root@gateway ~`；body mono `clamp(12px,3.2vw,15px)`，行高 1.7，`flex-wrap:wrap`：
  - `$ curl -fsSL https://raw.githubusercontent.com/moooyo/5gpn/main/quick-install.sh | sudo bash`（`$` 青色，URL 紫色）
  - 右侧"复制"按钮（mono 12px，透明底 + `rgba(255,255,255,.18)` 边，radius 8px，min-width 56px）：点击复制完整命令并显示"已复制"1.6s
- 下方注释（14px `--muted` 居中）："也可在 checkout 内运行 `sudo bash install.sh`，支持环境变量预置与内网部署。"（code chip：mono、`--surface` 底、accent 色、radius 6px）

### 5. 原理（id how，`--surface` 底）
- eyebrow "原理 · 一次解析的旅程"；H2 "不是隧道，<br>是一次 DNS 解析决定去向"；sub（18px）"三类规则自上而下匹配。远端域名被解析成网关自己的 IP，自然漏斗进 mihomo 透明转发；直连域名返回真实 IP，网关不经手。"
- **4 张卡**（grid `repeat(auto-fit,minmax(220px,1fr))` gap 16px；卡：`--card` 底、`--border2` 边、radius 18px、padding 26px 22px；序号 mono 13px/700；标题 17px/600；正文 13.5px `--muted`/1.55）：
  1. `01`（accent）接入 — 客户端把全部 DNS 查询经 DoT :853 交给网关——唯一入口，证书自动续期、热重载。
  2. `02`（accent）判定 — force-direct / blacklist 优先命中；其余并发查询本地 UDP 与可信 DoT，按 chnroute 仲裁。
  3. `03`（**green**）直连 — 判定直连的域名返回真实 IP，客户端直连，网关不经手。
  4. `04`（accent）出站 — 判定远端的域名解析成网关 IP，流量漏斗进 mihomo，透明转发直出。
- 脚注（mono 13px `--faint` 居中）："chnroute 仲裁按答案 IP 归属判定、而非谁先应答——确定性正是当初自研的原因"

### 6. 去向（id modes，`--bg` 底）
- eyebrow "去向 · 出口全在应用层"；H2 "两种去向，多个出口"
- 两张大卡（grid auto-fit minmax(280px,1fr)，gap 24px，max-width 920px；radius 22px，padding 34px）：
  - 绿卡（border `rgba(52,199,89,.28)`，shadow `0 10px 40px rgba(52,199,89,.06)`）：tag "直连 · DIRECT"（mono 12.5px，`#248a3d` on `rgba(52,199,89,.12)`，radius 8px）；H3 24px/700 "真实 IP，本地直出"；正文 15px；两条 `·` 列表（14.5px `--muted`）："零额外时延，本地流量零开销" / "force-direct 名单随手可加，内网域名精确直连"
  - 靛卡（border `rgba(94,92,230,.25)`）：tag "远端 · 经 MIHOMO"（accent on accentSoft）；H3 "解析成网关 IP，透明转发"；正文提 selector 切换；**出口胶囊行**：选中 `✓ 直出`（accent 底白字）+ 香港 / 日本 / 美国 / 新加坡（`--strokeIn` 边、`--muted` 字，12px/600，padding 4px 12px）；一条 `·` 列表 "无内核路由与策略路由，切换无需重启"
- 脚注（mono）："SNI 回源解析器可配置 · 出口列表随 mihomo 出站配置生效"

### 7. 特性（id features，`--surface` 底）
- eyebrow "特性"；H2 "简单，且确定"；sub "零 Python、极小依赖，一切行为可预期。"
- 6 张卡（grid auto-fit minmax(280px,1fr) gap 20px；radius 18px，padding 28px 24px）；每卡 38px 图标块（radius 11px，accentSoft 底，accent 描边线性图标 19px）+ 标题 17px/600 + 正文 13.5px：
  1. 确定性 chnroute 仲裁 — 并发查询本地 UDP 与可信 DoT，按答案 IP 归属判定直连或直出，不是竞速——这是 smartdns 做不到、当初自研的根本原因。（准星图标）
  2. DoT-only 入口 — 客户端唯一的 DNS 传输是 DoT :853，Let's Encrypt 证书按文件 mtime 热重载、自动续期；Android / iOS 原生支持。（锁）
  3. 规则订阅 — 进程内按各自 interval 定时拉取远程列表，支持 gfwlist / dnsmasq / hosts / cidr 等格式；拉取失败保留旧缓存，离线安全。（刷新箭头）
  4. 统一控制面 — Web 控制台、REST API、iOS 描述文件、Telegram bot 共用同一进程内 Controller，浏览器即达。（窗格）
  5. fail2ban 式防护 — 登录失败超阈值自动封锁来源 IP；控制台令牌可用 `5gpn --rotate-token` 一键轮换。（盾牌）
  6. 零依赖 · 运维友好 — Go 侧仅两个依赖，网关上不放工具链、从不现场编译；systemd 硬化沙箱、统计持久化存活重启、证书续期无需重启服务。（烧杯）

### 8. 接入三步（id setup，`--bg` 底）
- eyebrow "接入 · 三步"；H2 "三步接入，无需 App"
- 3 张卡（auto-fit minmax(240px,1fr) gap 22px，max-width 960px；radius 20px，padding 30px）；步骤徽章 38×38、radius 11px、accent 底白字 mono 700：
  1. 安装网关 — 一行命令交互式问答；自动下载预编译产物、签发并续期证书、拉起 systemd 服务，结束时打印控制台地址与 token。（链接"回到安装命令 ›" → `#install`）
  2. 客户端填 DNS — Android：设置 → 私人 DNS，填 `dot.<域名>`；iOS：扫安装结束打印的二维码，装 DoT 描述文件。
  3. 完成 — 本地直连、远端出站自动生效。规则订阅在进程内定时更新，拉取失败保留旧缓存，离线安全。

### 9. 控制台（id console，`--surface` 底，左文右图）
- 左列：eyebrow "控制台 · 装完即有"；H2 "统一控制面，<br>浏览器即达"；正文（16px/1.7）"…浏览器访问 `https://<域名>` 即达。"；4 条绿勾清单（14.5px，`--ink`，绿色 3px 描边勾 14px）：
  - Dashboard：verdict 分布与上游健康，实时可见
  - 规则与订阅：三类规则增删、订阅立即更新
  - Lookup：输入域名，模拟完整解析决策路径
  - Telegram bot：inline 菜单管理，热切换无需重启
- 右列浏览器窗口 mock：radius 18px、`--border` 边、`box-shadow:0 32px 64px -28px rgba(0,0,0,.3)`；bar 含 11px 红绿灯 + 居中 mono URL 胶囊（锁图标 + `5gpn.example.com`）；下方为控制台截图 `assets/console-dashboard.png`
- 布局：grid `repeat(auto-fit,minmax(300px,1fr))` gap 48px，align center

### 10. CLI（id cli，`--bg` 底，左文右终端）
- 左列：eyebrow "CLI · 一个命令"；H2 "一个 `5gpn` 命令<br>管理一切"（`5gpn` mono + accent）；正文提 `/etc/5gpn/dns.env` 单配置文件、重跑安装脚本即得全新产物
- 右列深色终端（bar 标签 `gateway ~ 5gpn`；body mono 13px、行高 2.05；左命令右注释，注释 `#8a8a8e` 溢出省略）：
  - `$ 5gpn` # 打开交互管理菜单
  - `$ 5gpn --status` # 服务 / 域名 / 列表状态
  - `$ 5gpn --add-domain d` # 强制代理某域名
  - `$ 5gpn change-resolver r` # 设置 SNI 回源解析器
  - `$ 5gpn --rotate-token` # 轮换控制台令牌
  - `$ 5gpn --ios` # 重新生成 iOS 描述文件 + 二维码

### 11. Footer（**两种主题下都保持深色** `#1d1d1f`，文字 `#a1a1a6`）
- grid `repeat(auto-fit,minmax(160px,1fr))` gap 32px 40px，max 1120px；padding `clamp(48px,8vw,64px) 24px`
- 品牌列：靛点 + "5GPN"（18px/600 `#f5f5f7`）+ "MIT License"（12px `#8a8a8e`）；简介"直出型智能分流 DNS / SNI 网关——解析即策略。需配合 KFCHost 与 5GPN 订阅包使用。"；**合规提示橙色警示框**（`rgba(255,159,10,.08)` 底、`rgba(255,159,10,.2)` 边、radius 12px）："仅用于已获合法授权的企业组网与技术研究，请遵守所在地法律法规。"
- 页面列：安装 / 原理 / 特性 / 接入 / 控制台（锚点）
- 相关列：GitHub / 文档 / 行为验收 / Releases / KFCHost 官网（外链，同旧站 URL）
- 说明列："一个 Go 二进制 + 一个配置文件。开源 MIT，欢迎 issue 与 PR；与 5GPN Relay 共享同一设计语言。"
- 链接色 `#a1a1a6` hover `#f5f5f7`；栏目标题 13px/600 `#f5f5f7`

## Interactions & Behavior
- **主题切换**：nav 按钮在 浅色 ↔ 深色 间切换（建议实现 relay 同款三态 自动/浅/深 + localStorage `5gpn-theme` + 首帧脚本防闪）；终端与 footer 不随主题变化
- **复制安装命令**：写入剪贴板，按钮文案 复制 → 已复制（1.6s 恢复）
- **hover**：CTA 胶囊 `translateY(-1px)` + 阴影加深；主题按钮换边框/底色；文字外链 `--muted`→`--ink`；均 `transition ~.18s ease`
- **锚点**：平滑滚动，`scroll-margin-top:60px`
- 示意图数据包循环动画 + 卡片 floaty 浮动；`prefers-reduced-motion: reduce` 时应停用（参照 relay）
- **待补**：分段控件 "Apple Relay" 的 `href` 当前为空字符串，由维护者补上 relay 站地址

## Responsive
- 所有卡片栅格用 `repeat(auto-fit, minmax(*, 1fr))` 自动换列（断点值见上文各节）
- `max-width:720px`：隐藏 KFCHost / GitHub 外链
- `max-width:560px`：主题按钮只留 ◐ 图标；隐藏方案分段控件
- 终端命令行 `flex-wrap:wrap` + `word-break:break-all`
- H1/H2/正文/内边距均用 `clamp()`，移动端自适应

## State Management
纯静态站，仅需：主题（localStorage + `data-theme` 属性）、复制按钮短暂态。无数据请求。

## Assets
- `assets/console-dashboard.png` — Current 1440×900 5gpn 0.0.14 Console overview capture, rendered with local fixture data.
- 图标为内联 SVG 线性图标（源自旧站，19px、stroke 2、round cap/join），无外部图标库
- 无外部字体（系统字体栈），无 emoji

## Files
- `5GPN Pages iOS Redesign.dc.html` — 完整设计稿（含全部精确样式值与 SVG 坐标；`<x-dc>` 内为页面结构，底部脚本含明暗主题变量表）
- `assets/console-dashboard.png` — 控制台截图
- `screenshots/` — 设计稿截图：01–08 浅色模式逐区块（Hero → Footer），09–10 深色模式
