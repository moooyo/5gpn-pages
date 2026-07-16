# Handoff: 5gpn-relay — Apple Relay 首页 + 配置生成器（iOS / Apple 风格）

## Overview
**moooyo/5gpn-relay** 站点两页的完整设计稿：首页（营销页）与配置生成器。与 5gpn-pages 的 DNS 网关改版共享同一 Apple 设计语言：系统字体、off-white/near-black 中性色、单一靛蓝 accent、胶囊按钮、浮动示意卡、深色终端与页脚、浅色/深色主题。

核心差异点（相对现有 relay 站）：
- 顶部导航新增 **方案切换分段控件**：`DNS 网关 ↗ | Apple Relay（当前）`，DNS 网关的链接**留空待补**（`href=""`）
- 品牌显示为 "5GPN Relay"（Relay 为 `--faint` 400 weight）
- 首页原理部分为 **4 步**：解析 / 判定 / 中继 / 直连（原"出口"并入"中继"）
- 首页 CTA、页脚"生成配置"、开始第 3 步均链到生成器页

## About the Design Files
两个 `.dc.html` 是 **HTML 设计稿/原型**，展示目标外观与交互，**不是生产代码**。请在 5gpn-relay 的现有结构（`web/index.html`、`web/generate.html` + `web/assets/styles.css` + JS）里重新实现，尽量复用现有 styles.css 的 token/类组织方式；两页设计稿间的相互链接（`5GPN Relay iOS Redesign.dc.html` ↔ `5GPN Relay Generator iOS Redesign.dc.html`）实现时替换为 `index.html` ↔ `generate.html`。

## Fidelity
**High-fidelity**。颜色、字号、间距、圆角、阴影为最终值。

## Design Tokens（两页共用，与 DNS 网关改版一致）

字体：
- Sans: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- Mono: `ui-monospace, 'SF Mono', Menlo, monospace`

固定色：
- accent 靛蓝 `#5e5ce6`；accentSoft `#5e5ce61a`；accentGlow `#5e5ce62e`
- CTA 蓝 `#0071e3` hover `#0077ed`
- green `#34c759`（深绿字 `#248a3d`）；orange `#ff9f0a`（橙字底 `#8a5a00` on `rgba(255,159,10,.14)`）
- 终端/页脚永远深色：bg `#1d1d1f`，bar `#2a2a2c`，文字 `#e8e8ed`，注释 `#8a8a8e`，prompt `#5ac8fa`，URL/代码高亮 `#a78bfa`，红绿灯 `#ff5f56 #ffbd2e #27c93f`

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

主题机制：默认浅色；`:root[data-theme="dark"]` 强制深色；建议 `prefers-color-scheme` 自动 + `localStorage('5gpn-theme')` 首帧防闪（relay 现有实现可沿用）。

其他：内容最大宽首页 `1120px`、生成器 `1040px`；section 内边距 `clamp(60px,9vw,100px) 24px`；圆角 胶囊 `980px` / 大卡 `22–24px` / 卡 `18–20px` / 终端 `16px` / 输入框 `12px` / 模式卡 `15px` / 徽章图标块 `11px` / code chip `6px`；`a{color:#0071e3}` hover `#0077ed`；`::selection rgba(94,92,230,.2)`；`html{scroll-behavior:smooth}`；锚点 `scroll-margin-top:60px`。

---

# 页面 A：首页（index.html）

### A1. Nav（sticky，两页同构）
- `sticky; top:0; background:var(--navbg); backdrop-filter:saturate(180%) blur(20px); border-bottom:1px solid var(--hairline)`；内层 1120px，高 64px，padding 0 28px
- 左组（gap 18px）：
  - 品牌：9px 靛蓝圆点（`box-shadow:0 0 0 3px accentSoft`）+ "5GPN Relay"（19px/600；"Relay" 为 `--faint`/400）
  - 分段控件：容器 `var(--surface)` 底 + `--border2` 边 + radius 980px + padding 3px
    - 未选段 "DNS 网关 ↗"：`min-height:28px; padding:0 14px; color:var(--muted)` hover `--ink`，12.5px/500，**`href=""` 留空**，`title="切换到 DNS 网关方案"`
    - 选中段 "Apple Relay"：`background:var(--card); color:var(--ink); font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,.08)`
- 右组（gap 10px）：外链 "KFCHost ↗"（`https://kfchost.com/center/`）、"GitHub ↗"（`https://github.com/moooyo/5gpn-relay`）（14px `--muted`→`--ink`）；主题按钮（胶囊 36px，`◐ 浅色/深色`）；蓝 CTA "生成配置" → `generate.html`

### A2. Hero
- 居中，`padding:clamp(60px,10vw,96px) 24px 40px`，背景 `radial-gradient(120% 90% at 50% 0%, var(--heroWash) 0%, var(--bg) 58%)`
- eyebrow "Apple Network Relay · MASQUE"（14px/600 accent，letter-spacing .02em）
- H1 "无需 VPN，也能**分流**。"（"分流" accent 色）：`clamp(38px,8.5vw,78px)/1.04/-.035em/700`
- lede（max 640px，`clamp(17px,2.6vw,22px)` `--muted`）："依靠 5GPN 与 Apple Relay 能力，实现按规则的分流访问——装的是描述文件，不是 VPN，状态栏干干净净。"
- CTA：蓝胶囊 "生成 iOS 配置 →" → `generate.html`；文字链 "看它怎么工作 ›" → `#how`
- 依赖行（14px）："需配合 KFCHost 专线主机 + **5GPN 订阅包** 使用"（KFCHost 链接）
- 4 chips（胶囊 13.5px + 6px 圆点）：无 VPN 图标（绿）· 无需监管 / MDM（靛）· 覆盖蜂窝（橙）· 带 UDP/QUIC（靛）

### A3. 分流示意卡
- 白卡 max 860px，radius 24px，shadow `0 20px 60px var(--hairline)`，浮动动画 `floaty 7s`（translateY 0→-7px→0）
- SVG `viewBox="0 0 820 320"`（精确坐标见设计稿）。节点（rx14，fill `--card`）：
  - iPhone（30,130 92×84）「iPhone / 蜂窝 · Wi-Fi」
  - 菱形分流点（200,172 ±24，fill `--heroWash`、stroke accent），下方 mono accent 标签 `SPLIT`
  - 直连目标（470,44 200×76，stroke green）「直连目标 / 本地直连 · DIRECT（绿）」
  - relay（300,230 116×62，stroke accent）「relay / MASQUE」
  - 5GPN 出口（500,230 140×62）「5GPN 出口 / EXIT · 专线节点」
  - 世界（700,225 92×72）「世界 / INTERNET」
- 连线：iPhone→菱形（灰）；菱形→直连目标（绿曲线）；菱形→relay（靛曲线）；relay→5GPN 出口（**橙虚线** dasharray 6 5 + 橙 mono 标签"专线"）；出口→世界（靛）
- 动画数据包 r=4.5：绿路 2 枚（dur 2.8s 错相 1.4s）、靛路 3 枚（dur 4.6s 错相 ~1.5s），`animateMotion`

### A4. 原理（id how，`--surface` 底）
- eyebrow "原理 · 一个数据包的旅程"；H2 "它不是 VPN，<br>是一个按规则工作的系统级中继"；sub（18px）"iOS 17 起，Apple 把系统级中继背后的 MASQUE 机制开放给了描述文件。整条链路是顺序发生的。"
- **4 张卡**（grid `auto-fit minmax(220px,1fr)` gap 16px；radius 18px，padding 26px 22px；序号 mono 13px/700，标题 17px/600，正文 13.5px/1.55 `--muted`）：
  1. `01`（accent）解析 — 先解析目标地址，判断它该本地直连还是交给 5GPN 中继；配套加密 DNS 保证解析稳定可靠。
  2. `02`（accent）判定 — 按所选规则匹配目标（自动含子域）：命中直连集就本地直出，否则交给中继。
  3. `03`（accent）中继 — 用 CONNECT / CONNECT-UDP（RFC 9298）经专线送到 KFCHost 节点，由节点在出口重新解析并连出——是 MASQUE 而非隧道网卡，状态栏没有 VPN 图标。
  4. `04`（**green**）直连 — 其余流量根本不进隧道，蜂窝 / Wi-Fi 正常出口，专线只承载真正需要它的流量。

### A5. 两种模式（id modes，`--bg` 底）
- eyebrow "两种模式 · 都支持自定义包含 / 排除"；H2 "选一条基线规则，再按需微调"
- 两张大卡（auto-fit minmax(280px,1fr) gap 24px，max 920px；radius 22px，padding 34px）：
  - 靛卡（border `rgba(94,92,230,.25)`，shadow `0 10px 40px rgba(94,92,230,.06)`）：tag "黑名单模式"（mono 12.5px accent on accentSoft，radius 8px）；H3 24px/700 "只有命中的走中继"；正文"命中名单的目标走 5GPN 中继，其余全部本地直连。"；列表：`≈150 KB` 徽章（accent on accentSoft，radius 6px）"描述文件小，专线只跑该跑的" / · 省专线、省电，适合日常使用 / · 名单未覆盖的新目标会走直连（随订阅更新）
  - 绿卡（border `rgba(52,199,89,.28)`）：tag "白名单模式"（`#248a3d` on `rgba(52,199,89,.12)`）；H3 "未命中的全部走中继"；正文"只有命中名单的目标本地直连，其余全部走中继，覆盖最全。"；列表：`≈3.8 MB` 徽章（`#8a5a00` on `rgba(255,159,10,.14)`）"名单约 11 万条，描述文件较大" / · 目标在 KFCHost 节点解析，链路最干净 / · 新目标默认走中继不会漏，适合全量分流
- 脚注（mono 13px `--faint`）："规则名单随 5GPN 订阅包每日更新分发，可在生成器里叠加自定义包含 / 排除"

### A6. 开始使用（id start，`--surface` 底）
- eyebrow "开始使用 · 三步"；H2 "配合 KFCHost 与 5GPN 订阅包"；sub "5GPN Relay 负责分流与描述文件；专线出口与规则订阅由 KFCHost 与 5GPN 订阅包提供。"
- 3 张卡（auto-fit minmax(240px,1fr) gap 22px，max 960px；radius 20px，padding 30px；38px accent 底白字步骤徽章 radius 11px）：
  1. 开通 KFCHost 专线主机 — …（链接 "前往 KFCHost 官网 ›" → `https://kfchost.com/center/`）
  2. 订阅 5GPN — 获取 5GPN 订阅包与访问令牌。规则名单每日更新，随订阅自动分发。
  3. 生成并安装配置 — …（链接 "打开生成器 ›" → `generate.html`）

### A7. 安装（id install，`--bg` 底）
- eyebrow "安装 · KFCHost 专线主机"；H2 "一条命令拉起中继服务器"；sub "在你的 KFCHost 专线主机上（Debian / Ubuntu / CentOS / Rocky，root）运行。它会装好 Docker、gum、Node，签证书、起 Envoy，并生成 iOS 配置 + 二维码。"
- 深色终端（max 840px；bar 标签 `root@kfchost-box`）：
  - `$ curl -fsSL https://moooyo.github.io/5gpn-relay/install.sh | sudo bash`（`$` 青、URL 紫）
  - "复制"按钮：写剪贴板，文案 复制→已复制（1.6s）
- 注释："需要一个指向 KFCHost 主机、经专线可达的域名。装完后运行 `relayctl profiles` 生成配置并出二维码，或用网页生成器自定义规则。"

### A8. Footer（永远深色 `#1d1d1f` / `#a1a1a6`）
- 品牌列：靛点 + "5GPN Relay"；简介"基于 Apple Network Relay（MASQUE）把 iOS 流量按规则做内网分流，经专线直达 KFCHost 节点——无 VPN 图标。需配合 KFCHost + 5GPN 订阅包。"；橙色警示框（`rgba(255,159,10,.08)` 底 `rgba(255,159,10,.2)` 边 radius 12px）两段："**未签名描述文件**安装时显示「未验证」，自用可接受。" / "**令牌即权限**：泄露 = 开放代理，请用 `relayctl rotate` 轮换。"（`relayctl rotate` mono 紫 `#a78bfa`）
- 页面列：原理 / 两种模式 / 开始使用 / 安装（锚点）
- 相关列：生成配置（→ generate.html）/ **DNS 网关方案（`href=""` 留空待补）** / GitHub / KFCHost 官网
- 说明列："请遵守当地法律法规与网络使用政策。仅技术工具，需配合 KFCHost 专线主机与 5GPN 订阅包使用；与 DNS 网关方案共享同一设计语言。"

---

# 页面 B：配置生成器（generate.html）

### B1. Nav
同 A1，差异：内层 max 1040px；右组仅 "‹ 返回首页"（→ index.html，14px `--muted`→`--ink`）+ 主题按钮（无 CTA、无外链）；品牌链接 → index.html。

### B2. 页头（左对齐，max 660px）
- eyebrow（mono 12.5px/600 accent，letter-spacing .06em）"生成器 · 本地生成，令牌不离开这台设备"
- H1 "生成你的 iOS 配置"：`clamp(34px,5.2vw,54px)/1.04/-.025em/700`
- lede（19px `--muted`）："填入中继域名和令牌，选一种分流模式，需要时加自定义规则。描述文件完全在你的浏览器里生成——不上传、不进仓库。"
- main 容器：max 1040px，padding `64px 24px 110px`

### B3. 双栏布局
`grid-template-columns: minmax(0,1.35fr) minmax(300px,.85fr); gap:26px; align-items:start`；`≤760px` 单栏、右栏取消 sticky。

### B4. 左栏表单卡（`--card` 底，`--border` 边，radius 22px，padding 30px，纵向 gap 24px）
1. **中继域名**：label 13px/600；input `padding:13px 15px; border:1px solid var(--strokeIn); radius:12px; font-size:16px`，focus `border accent + 0 0 0 4px accentGlow`；placeholder `relay.example.com`；hint（12.5px `--faint`）"你的 KFCHost 主机域名，经专线可达。写入配置的 `HTTP2RelayURL`。"
2. **令牌 Token**：`type=password` mono；hint 带绿点 "令牌只留在本机，不会写进二维码或链接。"
3. **分流模式**（大按钮单选，纵向 gap 12px；`border:2px solid var(--strokeIn); radius:15px; padding:16px 18px`，透明底）：
   - 黑名单卡：tag 行（mono 12.5px accent"黑名单模式"+ 右侧 22px 圆形 ✓ 徽章 accent 底、仅选中时显示）；标题 15.5px/600 "只有命中的走中继"；说明 13px `--faint` "命中名单的目标走 5GPN 中继，其余全部直连 · 文件小"；**选中态**：`border-color:accent; background:accentSoft`
   - 白名单卡：同构，绿色系（tag `#34c759`、✓ 徽章绿底、选中 `border #34c759; background rgba(52,199,89,.12)`）；"未命中的全部走中继"；"只有命中名单的目标直连，其余全部走中继 · 文件较大"
4. **自定义规则**（上边框分隔，padding-top 22px）：标题 "自定义规则 · 在所选模式上叠加" + 说明 "无论选哪种模式，都能自己指定一部分目标的走向。每行一个域名，自动含子域。"
   - "走代理的规则 · 强制走中继"（label 靛点 + accent 字）→ textarea（mono 14px，radius 12px，min-height 92px，focus 靛）
   - "不走代理的规则 · 强制直连"（绿点 + `#248a3d` 字）→ textarea（focus 绿 `0 0 0 4px rgba(52,199,89,.14)`）
5. **高级折叠**（`<details>`，summary mono 13px accent "▸ 高级：DNS / 传输"）：
   - DoH 解析器 input（可选，placeholder `https://relay.example.com/dns-query`）+ hint "附带一个 DNS 描述文件，让解析更稳定并正确触发中继。"
   - checkbox "同时启用 HTTP/3（QUIC）中继地址"（默认关）
   - checkbox "允许在「设置」里手动开关中继"（默认开）；checkbox 19px `accent-color:var(--accent)`

### B5. 右栏「输出」卡（sticky top:76px；radius 22px，padding 28px，shadow `0 1px 3px rgba(0,0,0,.04), 0 20px 50px var(--border2)`）
- 标题 "输出"（mono 12.5px/600 `--faint`，letter-spacing .06em）
- 摘要行（13.5px，`--border2` 下边框分隔）：模式（黑=accent 字"黑名单模式"/白=`#248a3d`"白名单模式"）｜走中继域名｜直连域名｜预估大小（mono）
  - 黑名单：走中继 = `1 284 + 自定义包含条数` 条；直连 = "其余全部（+ N 条）"；大小 ≈150 KB
  - 白名单：走中继 = "其余全部"；直连 = `112 409 + 自定义排除条数` 条；大小 ≈3.8 MB
  - （基数 1284 / 112409 来自内置精选列表，实现时用真实数据）
- 操作区（margin-top 22px，纵向 gap 11px）：
  - 域名+令牌都非空：蓝色主按钮 "安装到本机"（padding 14px，radius 13px，16px）+ 次按钮 "下载 .mobileconfig"（`--strokeIn` 边，`--card` 底）
  - 否则：灰占位条（`--surface` 底 `--faint` 字）"填入域名和令牌后即可生成"
- 模式提示条（`--surface` 底 + `--hairline` 边，radius 12px，12.5px）：黑名单 → "黑名单：描述文件小、省专线，适合日常使用；名单未覆盖的新目标默认直连。"；白名单 → "白名单：覆盖最全，未命中名单的一律走中继；目标在 KFCHost 节点解析，链路最干净。"
- 底部（上边框分隔）：132px 二维码（设计稿为 QR 占位，实现用现有 qrcode 库，**内容为生成器 URL，不含令牌**）+ 说明 "用另一台手机扫码，在手机上打开这个生成器（不含令牌）" + URL（mono 10.5px）

### B6. 源码预览 + 页脚注
- `<details>` "▸ 查看生成的 .mobileconfig 源码（令牌已隐藏）"：深色 pre（`#1d1d1f` 底 `#e8e8ed` 字，radius 16px，mono 12.5px，max-height 440px 滚动），实时渲染 plist，令牌显示 `••••••••`
- 结尾注（mono 13px `--faint`，max 760px）："安装后 iOS 会显示「未验证」——这是未签名描述文件的正常提示。在 设置 › 通用 › VPN、DNS 与设备管理 里可查看或删除。内置精选域名列表用于浏览器生成；完整每日更新列表由服务端 `relayctl profiles` 提供。"

## Interactions & Behavior
- **主题切换**（两页）：浅 ↔ 深；建议三态 自动/浅/深 + `localStorage('5gpn-theme')` + 首帧防闪；终端/页脚/源码 pre 不随主题变化
- **首页**：复制安装命令（复制→已复制 1.6s）；锚点平滑滚动；示意图数据包动画 + 卡片 floaty；`prefers-reduced-motion` 时停用动画
- **生成器**：
  - 模式单选：点击整卡切换，`aria-pressed` 标记，✓ 徽章仅选中时显示
  - 摘要实时联动：模式、自定义规则条数（按非空行计数）、预估大小
  - 主按钮门槛：域名 + 令牌均非空才出现"安装到本机 / 下载"，否则灰条提示
  - 安装到本机 = 生成 .mobileconfig 并触发下载/安装（沿用现有 generate.html 的生成逻辑）；令牌只进文件、不进 URL/二维码
  - hover：按钮 `translateY(-1px)`/换底色，transition ~.18s
- **留空待补**：两页分段控件及页脚中「DNS 网关」的 `href=""`

## Responsive
- 栅格均 `auto-fit minmax(*,1fr)` 自动换列；生成器 `≤760px` 单栏（右栏跟随内容流、取消 sticky）
- `≤720px` 隐藏首页 KFCHost/GitHub 外链；`≤560px` 主题按钮只留 ◐、隐藏分段控件
- 终端命令 `flex-wrap + word-break:break-all`；H1/H2/内边距 `clamp()`
- 输入框 16px 字号（避免 iOS 聚焦缩放）

## State Management
纯静态：主题（localStorage + data-theme）；生成器为纯前端状态（域名/令牌/模式/规则文本/复选项），无网络请求；plist 在浏览器内拼接。

## Assets
- 无图片资源；示意图为内联 SVG（坐标在设计稿里），图标为内联线性 SVG
- 系统字体栈，无外部字体/图标库/emoji
- 二维码：实现时用仓库现有 qrcode 方案

## Files
- `5GPN Relay iOS Redesign.dc.html` — 首页设计稿（完整样式值 + SVG 坐标；底部脚本含明暗主题变量表）
- `5GPN Relay Generator iOS Redesign.dc.html` — 生成器设计稿（含交互逻辑参考：模式切换/摘要联动/按钮门槛）
- `screenshots/` — 01–05 首页浅色逐区块，06 首页深色，07–09 生成器（默认 / 已填写+白名单 / 深色）
