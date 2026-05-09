# Best Use of ElevenLabs

**奖品**：无线耳机
**评审方**：MLH
**官网**：[elevenlabs.io](https://elevenlabs.io/)
**MLH partner 页**：[mlh.com/partners/elevenlabs](https://www.mlh.com/partners/elevenlabs)

---

## 这是什么？

[ElevenLabs](https://elevenlabs.io/) 是当下最强的 **AI 语音合成（TTS）+ 语音克隆 + 对话式语音 Agent** 公司之一。它的输出听起来像真人——情感、停顿、语气都自然——这就是它和老牌 TTS（Polly、Azure、Google）的差距。

它能做：
- **TTS（文本转语音）**：贴一段文字，给你一段自然的人声，多语言、多音色。
- **Voice Cloning**：上传自己几分钟的录音，复刻你的声音（hackathon 注意：要拿到本人许可！）。
- **Conversational AI Agents**：实时双向语音对话。延迟很低，能打断、能流畅互动——做语音助手非常顺手。
- **Sound Effects / Music**：文本生成音效。
- **Speech-to-Speech**：把一段录音换成另一种音色/情感。

## 为什么 hackathon 项目偏爱它

- **API 一行就能听到效果**——没有比这门更容易出 demo 的 sponsor 了。
- 评委一上手就能感受到差距（机器味 vs. 人声）。
- "**给项目加一层语音**" 几乎适合所有 track：教育、无障碍、娱乐、辅助。

## 上手路径

1. 注册 [elevenlabs.io](https://elevenlabs.io/)。MLH 现场会给 **3 个月免费订阅 promo code**——找 MLH coach 或在赛前邮件里找。
2. 看 [开发者快速开始](https://elevenlabs.io/docs/api-reference/quick-start)。
3. 最小例子（Python）：
   ```python
   from elevenlabs.client import ElevenLabs
   client = ElevenLabs(api_key="…")
   audio = client.text_to_speech.convert(
       voice_id="21m00Tcm4TlvDq8ikWAM",
       model_id="eleven_multilingual_v2",
       text="你好，HackDavis！",
   )
   with open("out.mp3", "wb") as f:
       for chunk in audio:
           f.write(chunk)
   ```
4. 想做 *双向对话* 的，看 [Conversational AI / Agents 文档](https://elevenlabs.io/docs/conversational-ai/overview)。

## 项目思路

| 思路 | 一句话描述 | 切合的其它奖项 |
| --- | --- | --- |
| **盲人导航助手** | 摄像头/GPS + LLM + ElevenLabs 实时语音播报路况 | Social Justice、Hardware |
| **儿童有声故事生成器** | 输入主题 → LLM 写故事 → ElevenLabs 多角色配音 | Most Creative、Social Good |
| **语言学习陪练** | 语音对练，纠正发音 + 即时回应 | User Research、Social Good |
| **逝者的声音/家史档案** | 老人讲述，转录 + 克隆音色，子孙后代可以"问问祖父" | Most Creative（注意伦理边界） |
| **多语言医生问诊翻译** | 病人和医生分别说本族语，实时语音翻译且保留语气 | Social Justice |
| **Wellspring 自动接待** | 走进 Wellspring 的人不会用电脑——纯语音问"我能领什么物资？" | Wellspring、Social Good |
| **可访问性朗读插件** | 浏览器扩展，把网页内容流畅朗读，比系统 TTS 自然 | User Research |

## 评审 Tips

- 在 demo 视频里**让评委听到声音**——不只是截图。两段对比（默认 TTS vs. ElevenLabs）会拉开差距。
- Conversational Agent 比纯 TTS 更"哇塞"，但调通延迟与打断需要 1-2 小时，提前预留。
- 如果要做声音克隆，**只克隆已获明确同意的声音**（比如自己或队友）。展示时说清楚来源。
- Devpost 提交时勾上 "Best Use of ElevenLabs"，并附"播放按钮可点的 demo 链接"（hosted MP3 / Loom 视频）。

## 关键链接

- 官网：[elevenlabs.io](https://elevenlabs.io/)
- 文档：[elevenlabs.io/docs](https://elevenlabs.io/docs/api-reference/quick-start)
- Conversational AI：[elevenlabs.io/docs/conversational-ai](https://elevenlabs.io/docs/conversational-ai/overview)
- MLH partner 页：[mlh.com/partners/elevenlabs](https://www.mlh.com/partners/elevenlabs)
- 他们自己的 hackathon 平台（往届灵感）：[hacks.elevenlabs.io](https://hacks.elevenlabs.io/)
