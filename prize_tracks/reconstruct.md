# Best Use of Reconstruct

**奖品**：每位团队成员 $125 Visa 礼卡
**官网**：[reconstructinc.com](https://reconstructinc.com/)

---

## 这是什么？

[Reconstruct Inc.](https://reconstructinc.com/) 是一家建筑科技公司，主打 **Reality Capture / Digital Twin（数字孪生）**——用 360° 相机、无人机、激光雷达等设备扫描施工现场，再把扫描得到的点云、照片、3D 模型与 BIM 设计、施工进度计划自动叠合。它的旗舰产品是 [Visual Command Center](https://reconstructinc.com/solutions)：一个能让总包/业主/监理远程"走"工地、对比"计划 vs. 实际进度"的可视化平台。

核心能力：
- **3D 重建**：照片 + 视频 → photogrammetric 点云 / mesh
- **Geo-referencing**：把扫描结果对齐到真实坐标
- **进度追踪**：BIM 模型 vs. 当前现场的差异检测
- **远程巡检**：浏览器里"走进"工地

> 注意：截至 2026-05-08，Reconstruct 的公开 SDK/API 文档不像 Solana / Anthropic 那样面向开发者公开。**HackDavis 现场很可能由 Reconstruct 工程师提供数据集/账号/API key**——开赛后第一时间找他们的 mentor 拿凭证和文档。

## 为什么会出现在 hackathon？

HackDavis 强调 *社会公益*——而建造业是数字化最慢的传统行业之一，浪费、安全事故、工期延误每年损失上千亿美元。Reconstruct 把 AI/CV 引入这条链路，所以 hackathon 项目的方向通常是：
- 给已有的 reality-capture 数据加一层 AI 分析（识别风险、自动化报告、安全合规检测）
- 做一个面向小工地/独立承包商/检查员的 **轻量前端**（他们的旗舰产品是企业级 SaaS）
- 把建筑数据可视化做成更易懂的形式（科普、教育、社区监督）

## 上手路径（赛前能做的）

1. 看 [Solutions 页](https://reconstructinc.com/solutions) 和 [博客](https://blog.reconstructinc.com/)，理解他们的术语：reality capture、photogrammetry、BIM、4D scheduling、geo-referenced。
2. 浏览演示视频：[360 Reality Capture & Photogrammetry Demo](https://reconstructinc.com/pc/360-reality-capture-photogrammetry-1)。
3. 熟悉相关开源工具，万一 Reconstruct 的 API 没准备好，可以替代或互补：
   - [COLMAP](https://colmap.github.io/) / [Meshroom](https://alicevision.org/) — photogrammetry 重建
   - [Open3D](http://www.open3d.org/) — 点云处理（Python）
   - [Three.js](https://threejs.org/) / [potree](https://potree.org/) — 浏览器里渲染点云
4. 准备一个能跑的 demo 数据：手机绕一圈拍 30 张照片就够 COLMAP 重建出小场景。

## 项目思路（按"创意 + 显著使用"打分）

| 思路 | 一句话描述 | 切合的其它奖项 |
| --- | --- | --- |
| **AI 安全员** | 在 Reconstruct 的现场图像上跑 YOLO/VLM，自动标记没戴安全帽、占用通道、堆放危险品 | Best AI/ML、Social Justice |
| **进度对账机器人** | 上传两期扫描，自动生成"本周进度 vs. 计划"的差异报告 + 自然语言摘要 | Best AI/ML |
| **Accessibility 巡检** | 用 reality capture 数据自动检查 ADA 合规（坡道角度、门宽、消防通道） | Social Justice、User Research |
| **公益建筑透明度** | 把公共项目（学校改建、低收入住房）的扫描结果做成市民可浏览的网页 | Social Good |
| **VR 工地培训** | 把扫描结果导出 → 用 Three.js / WebXR 做新工人安全培训沉浸场景 | Most Creative、Hardware |
| **轻量 Reconstruct for SMB** | 手机拍照 → 自动重建 → 简化版的 Visual Command Center，专为 5 人以下小承包商 | Entrepreneurship |

## 评审 Tips

- 评审标准的两个关键词是 **creative** 和 **prominent + efficient**——只在 README 里"提一句用了 Reconstruct"是不够的，要让 Reconstruct 是项目的*核心数据源或处理环节*。
- Demo 里务必出现 Reconstruct 的可视化或数据流程（截屏 / GIF / 现场对比）。
- 如果 Reconstruct API 没拿到，备用路径：用 COLMAP 自己跑一个小型 reality capture pipeline，再把项目定位成"如果接入 Reconstruct，能放大成 X 倍"，并在 demo 里展示替代实现 + 集成接口设计。
- 开赛后立刻去找 Reconstruct 的 booth 问：①是否提供示例数据集 ②是否给 API key/token ③有没有特定希望解决的问题（很多 sponsor 会私下透题）。

## 关键链接

- 官网：[reconstructinc.com](https://reconstructinc.com/)
- 博客（产品讲解最清楚）：[blog.reconstructinc.com](https://blog.reconstructinc.com/)
- 演示：[360 Reality Capture demo](https://reconstructinc.com/pc/360-reality-capture-photogrammetry-1)
- 解决方案总览：[reconstructinc.com/solutions](https://reconstructinc.com/solutions)
