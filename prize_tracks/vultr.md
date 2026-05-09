# Best Use of Vultr

**奖品**：便携显示屏
**评审方**：MLH
**官网**：[vultr.com](https://www.vultr.com/)
**MLH challenge 页**：[mlh.com/challenges/...](https://www.mlh.com/challenges/019ce28a-00d0-9ec2-f07a-16ab8a608ac5)

---

## 这是什么？

[Vultr](https://www.vultr.com/) 是一家 **云基础设施商**，业务对标 AWS / GCP / DigitalOcean / Linode。卖点：
- **一键开机器**（< 60 秒）
- **价格便宜**（按小时计费，几美分起）
- 有 **Cloud GPU**（NVIDIA A100/A40/L40S 等）→ 这是 hackathon 的杀手锏，可以微调模型 / 跑 stable diffusion / 跑 LLM 推理
- 全球 32 个 region

总结成一句：你想"把项目部署到一个真实的公网地址 + 跑一个 GPU 任务"，Vultr 是 hackathon 期间最便宜的选项。

## 评审标准（拆解）

> "Sign up for a Vultr account and claim some free credits. **You must submit a screenshot of your Vultr profile landing page to complete this challenge submission.**"

注意红线：
1. **必须注册 Vultr 账号**（用 hackathon 邮箱即可）。
2. **必须提交一张 Vultr profile 页面的截图**——这条容易被忽略，没截图就没奖。
3. MLH coach 处可以拿到 **$100 Gift Code**（不需信用卡）。

## 上手路径

1. 注册 [vultr.com](https://www.vultr.com/)。
2. 跟 MLH coach 拿 gift code，兑换 $100 credits。
3. 部署一台 Cloud Compute（最便宜的 $6/月 VM）→ `ssh` 进去 → `git clone` 你的项目 → 跑起来。
4. 想跑 GPU：选 [Cloud GPU](https://www.vultr.com/products/cloud-gpu/) 实例。注意按小时算钱，**用完立刻销毁实例**。
5. 部署 web 应用最快路径：用他们的 [Vultr Compute](https://docs.vultr.com/) + Caddy / Nginx，或直接 `docker run`。
6. 文档：[docs.vultr.com](https://docs.vultr.com/)；API/CLI：[vultr.com/api](https://www.vultr.com/api/)。

## 项目思路（Vultr 是"基础设施"，所以一般是配菜，但要让评委明确看见）

| 思路 | Vultr 在其中扮演什么 |
| --- | --- |
| **公开可访问的 demo** | 把你的 Next.js / Flask 应用部署到 Vultr，给评委一个公网 URL（比 ngrok 更靠谱） |
| **GPU 微调记录** | 在 Vultr Cloud GPU 上 fine-tune 一个 ML 模型，截图 + 时长 + cost 写到 README |
| **多 region 实验** | 把 API 部署到 3 个 region，前端测延迟差异（很容易出图） |
| **AI 应用后端** | Backboard / OpenAI 调用全在 Vultr 一台 VM 上跑，避免 localhost demo 翻车 |
| **批处理 / 数据采集** | Best Statistical Model 类项目，跑一晚上数据采集 + 训练在 Vultr 上 |

## 评审 Tips

- 这条 track **更像 add-on**——主项目去拿别的奖，顺手把后端部署到 Vultr，截一张 profile 页面图。
- 在 README 加一节 "**Deployment**"，写：实例规格、所在 region、月成本估算、为什么选 Vultr。简短一段就够。
- Devpost 提交时确保附上 Vultr profile 截图。

## 关键链接

- 官网：[vultr.com](https://www.vultr.com/)
- Cloud GPU：[vultr.com/products/cloud-gpu](https://www.vultr.com/products/cloud-gpu/)
- 文档：[docs.vultr.com](https://docs.vultr.com/)
- 学生 / startup credits：[vultr.com/promo](https://www.vultr.com/) 或赛中 MLH coach
- MLH challenge：[mlh.com/challenges/...](https://www.mlh.com/challenges/019ce28a-00d0-9ec2-f07a-16ab8a608ac5)
