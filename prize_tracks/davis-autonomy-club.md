# Best Use of DAC Materials

**奖品**：$10,000 [Daytona](https://www.daytona.io/) infrastructure credits
**赞助方**：[Davis Autonomy Club（DAC）](https://www.davisautonomy.com/)
**官网**：[davisautonomy.com](https://www.davisautonomy.com/)

---

## 谁是 DAC？

[Davis Autonomy Club](https://www.davisautonomy.com/) 是 UC Davis 工学院的学生社团，专注做 **自主机器人**——无人机、机械臂、自动驾驶小车等等。他们也是 UC Davis [College of Engineering 官方认可的学生组织](https://engineering.ucdavis.edu/undergraduates/student-organizations) 之一。这条 track 由他们主办，主题是**视觉驱动的机器人控制**。

## 评审标准（拆解）

> 必须使用一项或多项 DAC materials，构建 vision-based AI pipeline，实现/配置 **VLM**（Vision-Language Model）或 **VLA**（Vision-Language-Action Model），把真实视觉感知和物理机器人行为打通。

翻译成人话：
- **DAC materials**：他们会现场提供硬件（无人机？机械臂？仿真器？）/ 数据集 / 代码模板。**开赛后第一时间去他们 booth 拿**——是什么材料、长什么样、怎么用，会决定你的项目走向。
- **Vision-based AI pipeline**：摄像头/图像 → AI 模型 → 输出
- **VLM**（Vision-Language Model）：看图说话/回答问题。例：[GPT-4o](https://openai.com/index/gpt-4o-system-card/)、[LLaVA](https://llava-vl.github.io/)、[Qwen2-VL](https://github.com/QwenLM/Qwen2-VL)、[CLIP](https://github.com/openai/CLIP)。
- **VLA**（Vision-Language-Action Model）：在 VLM 基础上**直接输出动作指令**给机器人。例：[OpenVLA](https://openvla.github.io/)、Google 的 [RT-2](https://robotics-transformer2.github.io/)、Physical Intelligence 的 [π0](https://www.physicalintelligence.company/blog/pi0)。
- **真实视觉 → 物理行为**：评委想看到一个闭环：摄像头看到了 → 模型理解了 → 机器人/仿真里**真的动了**。

## 关键概念区分

```
       图片 / 视频
          │
          ▼
   ┌──────────────┐
   │     VLM      │  ←  "这是什么物体？""请描述场景"
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │   规划/推理   │  ←  把语言转成动作意图
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │     VLA      │  ←  直接预测：关节角度、速度、抓取位置
   └──────────────┘
          │
          ▼
        机器人/仿真
```

VLM 已经成熟（API 即开即用），**VLA 是更新更难的部分**，但开源项目 ([OpenVLA](https://openvla.github.io/)) 已经能 fine-tune 单 GPU 跑起来。

## 上手路径

**没有真机器人也能做** — 用仿真：
- [PyBullet](https://pybullet.org/) — 轻量物理仿真，Python 友好
- [MuJoCo](https://mujoco.org/) — Google DeepMind 开源，强化学习/机器人主流
- [LeRobot](https://github.com/huggingface/lerobot) — Hugging Face 出的机器人库，自带 VLA 训练 + 仿真
- [SAPIEN](https://sapien.ucsd.edu/) — UC San Diego 出的，有大量场景
- [ROS 2 + Gazebo](https://gazebosim.org/home) — 工业标准

**模型选择**：
- 先用现成 VLM API（最快）：Claude / GPT-4o / Gemini 都能直接喂图
- 想体现"VLA 配置"：fine-tune [OpenVLA](https://github.com/openvla/openvla) 或在仿真里试 [RT-2-style](https://robotics-transformer2.github.io/) 的 prompt 链

**$10k Daytona credits 怎么用**：[Daytona](https://www.daytona.io/) 是"安全运行 AI 生成代码的弹性云开发环境"——本质是云端 sandbox。**这个奖品很适合做训练/微调**：把 OpenVLA 微调任务跑在 Daytona 的算力上，省下本地 GPU。

## 项目思路

| 思路 | 一句话描述 |
| --- | --- |
| **语音指挥小车** | "去厨房的桌子右边" → VLM 解析场景 + VLA 规划路径，仿真车开过去 |
| **视觉抓取助手** | 摄像头对准桌面 → "请把红色的杯子放到托盘上" → 机械臂在仿真里完成 |
| **盲人辅助导航原型** | 手机相机 + VLM，实时口语描述路况、提示障碍 + 给出语音转向指令 |
| **AI 巡检无人机** | 仿真无人机巡视园区，VLM 检测异常（着火/漏水/陌生人），自然语言报警 |
| **人形机械臂学厨** | 用 VLA 模仿学习"倒水/切菜"——录制人示范视频微调 OpenVLA |
| **农业巡田** | 摄像头扫植物 → VLM 判断病害 → VLA 输出无人机路径 |

## 评审 Tips

- **闭环 demo > 静态截图**。哪怕仿真里只有 30 秒，也要展示"我说话/给图 → 机器人/小车执行"的全过程。
- 在 README 写清楚 **哪个部分是 VLM、哪个部分是 VLA**——评委是搞机器人的，会很在意这个区分。
- 如果用了开源 VLA（OpenVLA 等），明确写出"我做了什么 fine-tune / prompt 工程 / 数据增强"。
- 比赛前看一眼 [DAC 官网](https://www.davisautonomy.com/) 看有没有更新公告或材料预告。

## 关键链接

- DAC 官网：[davisautonomy.com](https://www.davisautonomy.com/)
- 支持基金（确认社团身份）：[give.ucdavis.edu/.../77099](https://give.ucdavis.edu/VCSA/77099)
- VLA 开源旗舰：[OpenVLA](https://openvla.github.io/) / [RT-2](https://robotics-transformer2.github.io/) / [π0](https://www.physicalintelligence.company/blog/pi0)
- 机器人库：[LeRobot](https://github.com/huggingface/lerobot)
- 仿真：[PyBullet](https://pybullet.org/) / [MuJoCo](https://mujoco.org/) / [SAPIEN](https://sapien.ucsd.edu/)
- Daytona（奖品价值所在）：[daytona.io](https://www.daytona.io/) / [GitHub](https://github.com/daytonaio/daytona)
