# Best Use of Backboard

**奖品**：[Tile Essentials Pack](https://www.tile.com/store/tile-essentials)（每位获奖成员各一份蓝牙追踪器套装）
**评审方**：MLH
**官网**：[backboard.io](https://backboard.io/)
**MLH challenge 页**：[mlh.com/challenges/...](https://www.mlh.com/challenges/019d7317-5810-787c-9a0c-6e46c81856c1)

---

## 这是什么？

[Backboard](https://backboard.io/) 是一个面向 AI 应用的 **统一 API + 持久记忆层**。它解决一个 LLM 开发的根本痛点：**模型默认是"无状态"的——每次新会话都失忆**。

Backboard 把以下能力打包进一个 API：

- **持久记忆**：跨页面刷新、跨会话、跨用户都活着的上下文
- **17,000+ LLM 路由**：一个接口背后接 OpenAI、Anthropic、Google、Mistral、本地模型……都能切
- **RAG**（检索增强生成）：丢文档进去就能问
- **Embeddings**
- **Tool calls**（函数调用）

简单理解：把"做一个有记忆的 AI 助手"会用到的五六个服务，缝合成一个 SDK。

## 关键卖点（决定项目立意）

| 普通 AI 应用 | 用 Backboard 后 |
| --- | --- |
| 用户重新登录后助手忘掉一切 | 助手记得用户上次说过什么 |
| 切换 LLM 要重写 prompt 和 SDK | 改一个参数就能换 17,000+ 模型对比 |
| RAG 要自己搭 vector DB + chunker + retriever | 一个 API call 搞定 |

## 上手路径

1. 注册：[app.backboard.io/hackathon](https://app.backboard.io/hackathon)（有 hackathon 专属入口和免费额度）。
2. 拿 API key。
3. 看 [文档 / changelog](https://backboard.io/changelog) 找最新接口。
4. 最小示例（伪代码，确认以官方 SDK 为准）：
   ```ts
   import Backboard from "backboard"
   const bb = new Backboard({ apiKey: process.env.BB_KEY })
   await bb.memory.add(userId, "用户喜欢素食、对花生过敏")
   const reply = await bb.chat({
     model: "claude-sonnet-4-6",      // 路由到任何支持的模型
     userId,                           // 自动注入该用户的记忆
     messages: [{ role: "user", content: "周末聚餐推荐？" }],
   })
   ```
5. 评测对比：他们公开了 [LoCoMo memory benchmark](https://github.com/Backboard-io/Backboard-Locomo-Benchmark)，赛中可以用来"证明"你为什么选 Backboard 而不是自己存。

## 项目思路（"长期记忆"是核心卖点）

| 思路 | 一句话描述 | 切合的其它奖项 |
| --- | --- | --- |
| **个人健康伙伴** | 长期记忆用户的过敏、用药、运动习惯，做饮食/运动建议 | Best AI/ML、Social Good |
| **学习陪伴** | 记住学生薄弱知识点，跨周复盘 + 自适应出题 | Social Good、User Research |
| **公益咨询助手** | 为 Wellspring 等非营利做一个"记得每个 client 上次需求"的接待助手 | Wellspring、Social Justice |
| **AI 模型 A/B 实验台** | 利用 17,000+ 模型路由，搭一个面向研究者的 prompt 对比平台 | Best AI/ML、Statistical Model |
| **跨设备 AI 笔记** | 在手机说一句、在电脑接着问，记忆跨端连贯 | Most Creative |
| **多角色叙事游戏** | 每个 NPC 有独立的 Backboard memory，玩家行为长期影响剧情 | Most Creative |

## 评审 Tips

- 评审重点是 *持久记忆 + 多模型路由* 是不是真的用上了。Demo 里展示一段"昨天/上一会话说过的事，今天重新打开还在"。
- 别只用 Backboard 当"普通 OpenAI 代理"——那等于没用 Backboard。
- 每位获奖成员都会拿到 Tile Essentials Pack，所以**记得在 Devpost 把每个 team member 都列上**。

## 关键链接

- 官网：[backboard.io](https://backboard.io/)
- Hackathon 入口：[app.backboard.io/hackathon](https://app.backboard.io/hackathon)
- 文档：[backboard.io/changelog](https://backboard.io/changelog)
- 博客：[backboard.io/blog](https://backboard.io/blog)
- LoCoMo benchmark（记忆评测）：[GitHub](https://github.com/Backboard-io/Backboard-Locomo-Benchmark)
- MLH challenge：[mlh.com/challenges/...](https://www.mlh.com/challenges/019d7317-5810-787c-9a0c-6e46c81856c1)
