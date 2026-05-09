# Best Hack for Women's Center

**奖品**：[Anker Nano 3-in-1 Portable iPhone Charger](https://www.anker.com/)
**赞助方 / 受众**：[Wellspring Women's Center](https://www.wellspringwomen.org/)
**HackDavis 内分类**：Non-Profit

---

## 谁是 Wellspring？

[Wellspring Women's Center](https://www.wellspringwomen.org/) 是 1987 年由 Catherine Connell 和 Claire Graham 两位 Sisters of Social Service 创立的、位于 **Sacramento**（不是 Davis 市内，但很近）的女性 drop-in center。

- 服务对象：**处境脆弱的女性及其子女**
- 每个工作日服务约 **200 位** 女性和儿童
- 提供：早餐 + 简餐、case management、免费心理咨询、艺术治疗、 enrichment classes、安全网服务
- **不接受联邦或州政府资助**——完全靠个人 / 公司 / 社团 / 学校 / 基金会 + 100+ 位志愿者
- 详情：[About 页](https://www.wellspringwomen.org/about) / [捐赠页](https://www.wellspringwomen.org/support) / [需求物资清单](https://www.wellspringwomen.org/donations)

## 题目原文（核心需求）

> Projects must create a digital system to **track donations** as they come in and go out. Wellspring is looking for a **straightforward, easy-to-use** digital tool that helps **staff and volunteers** quickly **log donated items**, **track how they are distributed**, and **generate basic reports** when needed.

拆解：
1. 录入：捐赠物品**进来**时，能很快记下来（who 不重要，what / how many 重要）。
2. 分发：物品**给出去**时，记一笔。
3. 报告：能生成一份"本月收到/发出 X"的简单报表。
4. **隐含约束**——这是评分的关键：
   - 用户是 **staff 和志愿者**，不是工程师，不是数据分析师。**界面必须傻瓜级**。
   - 设备可能是旧手机/平板/共享电脑。**不能假设有最新硬件**。
   - 网络可能不稳。**离线优先 / PWA** 是加分项。
   - 多语言（西班牙语在 Sacramento 普及率很高）。
   - 老志愿者可能视力一般。**大字 + 高对比度**。

## 设计思路

> Wellspring 已经在用某种方式记账（纸 / Excel / Google Sheets）。**最好的项目 = 比她们现在用的方法快一倍 + 不让她们改太多习惯**。

数据模型（最小可行）：
```
Donation
  id, date, donor (optional, free text), item, quantity, unit, condition, intake_volunteer

Distribution
  id, date, item, quantity, recipient_initials (no PII), volunteer

Inventory  (view, derived from above)
  item, on_hand
```

技术建议：
- **前端**：React / Next.js + 离线 PWA（[next-pwa](https://github.com/shadowwalker/next-pwa)）。或者更激进——**纯静态 HTML + IndexedDB**，在共享电脑上点开就能用。
- **后端**：Supabase / Firebase / 一个 Vercel + Postgres 都够。**别上来就微服务**。
- **录入加速**：
  - 大按钮 + 高频物品快捷键（"新衣服 / 罐头 / 婴儿用品"一键 +1）
  - 条码扫描（手机摄像头 + [`zxing-js`](https://github.com/zxing-js/library)）—— 但很多捐赠物没条码，要兜底
  - 语音输入（[`react-speech-recognition`](https://github.com/JamesBrill/react-speech-recognition) 或 ElevenLabs Conversational）
- **报告**：一键导出 PDF / CSV，邮件给主管。**做一个"周报模板"**，让她们能直接发给董事会。

## 项目思路（不止一种产品形态）

| 思路 | 适合什么类型的队伍 |
| --- | --- |
| **触屏自助记账亭** | 在前台放一台旧 iPad，志愿者点几下就完成。最贴合需求 |
| **微信小程序风格的手机端** | 志愿者在仓库里举着手机走动着记 |
| **PWA + 离线同步** | 重视工程严谨度，能展示 service worker |
| **"语音日志 + AI 整理"** | 志愿者下班时口述"今天收到 30 双袜子、5 罐婴儿奶粉"，AI 转结构化记录。叠加 [ElevenLabs](./elevenlabs.md) 也能加 sponsor 奖 |
| **送货路线 + 库存联动** | 物资分发到合作家庭时，自动扣减库存 + 标记送达 |
| **匿名捐赠者收据系统** | 用 [Solana](./solana.md) 的不可转移 NFT 给捐赠者发链上收据，永久可查（创意叠加 Solana track） |

## 评审 Tips

- **真实场景思维 > 炫技**。问自己：一个 65 岁、不太会用电脑的 volunteer，3 分钟内能不能学会用？
- Demo 里**模拟一次"收到捐赠 → 发出去 → 月底导出报告"的完整流程**。
- 在 README 写一段"**Deployment plan**"——Wellspring 不会自己跑 `npm install`，要解释你打算怎么交付（Vercel 链接？打印一份操作手册？培训 30 分钟？）。
- 看一下他们的 [需求物资清单](https://www.wellspringwomen.org/donations) 和 [About 页](https://www.wellspringwomen.org/about)，让 demo 数据"长得像他们真实的物资"（卫生用品、婴儿奶粉、罐头……），评委一眼能看出你做了功课。
- **隐私**：不要在系统里存受助者的真名 / 联系方式。用 initials 或 ID。

## 关键链接

- 官网：[wellspringwomen.org](https://www.wellspringwomen.org/)
- About：[wellspringwomen.org/about](https://www.wellspringwomen.org/about)
- 捐赠物资页（看他们实际收什么）：[wellspringwomen.org/donations](https://www.wellspringwomen.org/donations)
- 资金支持页（理解 financial 流）：[wellspringwomen.org/support](https://www.wellspringwomen.org/support)
- Volunteer 页（理解志愿者画像）：[wellspringwomen.org/volunteer](https://www.wellspringwomen.org/volunteer)
- UC Davis Health 合作介绍：[health.ucdavis.edu/.../wellspring-womens-center/2025](https://health.ucdavis.edu/blog/equity-diversity-inclusion/partners-with-wellspring-womens-center-to-support-women-and-children/2025/04)
