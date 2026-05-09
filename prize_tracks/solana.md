# Best Use of Solana

**奖品**：[Ledger Nano S Plus](https://shop.ledger.com/products/ledger-nano-s-plus)（一个硬件加密钱包）
**评审方**：MLH
**官网**：[solana.com](https://solana.com/)
**MLH challenge 页**：[mlh.com/events/prizes](https://www.mlh.com/events/prizes)

---

## 30 秒看懂

Solana 是一条 **公链 / blockchain**。和比特币、以太坊一类，但定位是"**速度极快、手续费极低**"——出块时间 ~400ms，单笔交易费 < $0.0025。这两点让它适合做：高频交互的应用、消费级产品、需要海量小额交易的业务（游戏内经济、社交打赏、链上身份）。

> 不要被"crypto / web3"吓到。从开发者角度看，Solana 就是一个特殊的"后端 + 数据库"：用户操作触发链上交易，链上保存"谁拥有什么 / 发生过什么"的可信状态。

## 关键概念（hackathon 够用版）

| 概念 | 类比 |
| --- | --- |
| **Wallet（钱包）** | 用户账户。一个公钥 = 一个地址，签名靠私钥 |
| **SOL** | 链上原生货币，付 gas 用 |
| **Token / SPL Token** | 类似 ERC-20，自定义资产/积分/凭证 |
| **NFT** | 唯一资产（卡牌、徽章、门票、所有权证明） |
| **Program**（≈ 智能合约） | 部署在链上的代码，用 Rust 写，框架推荐 [Anchor](https://www.anchor-lang.com/) |
| **RPC** | 你的应用与链通信的 HTTP/WS 端点 |
| **Devnet / Testnet** | 免费 SOL 的测试链，hackathon 全程用这个 |

## 上手路径（< 30 分钟跑通 hello-world）

1. 装 Solana CLI：
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   solana config set --url devnet
   solana-keygen new   # 生成本地钱包
   solana airdrop 2    # 拿 2 SOL（Devnet 免费）
   ```
2. 装 Anchor（写合约的框架）：[anchor-lang.com](https://www.anchor-lang.com/)
3. 前端最快路径：Next.js + [`@solana/wallet-adapter`](https://github.com/anza-xyz/wallet-adapter)，用户用 Phantom / Solflare 等钱包扫码登录。
4. 不想写 Rust？用 [Metaplex](https://developers.metaplex.com/)（NFT/Token 即开即用）+ [Helius](https://www.helius.dev/) RPC + 纯 TypeScript 前端，48 小时完全够。

## 项目思路（评审眼里"用得上 Solana"的特征）

> Solana 的优势 = 高频 + 低费 + 链上可信。**避坑**：纯 NFT mint 这种已经被做烂的，得分低；要展示 *为什么需要链*。

| 思路 | 一句话描述 | 关键点 |
| --- | --- | --- |
| **微捐赠社交** | 看到喜欢的内容/帖子点一下 → 链上 0.001 SOL 即时转给作者 | 高频小额交易正是 Solana 的强项 |
| **链上签到 / 课堂出勤** | 学生扫码 → 钱包签名一次 → 出勤记录上链不可篡改 | 教育公益方向，可叠加 Social Good track |
| **游戏内经济原型** | 简单网页小游戏，金币 = SPL token，皮肤 = NFT，可在玩家间免费转 | 高频转账场景 |
| **DAO 投票工具** | 校园社团决议 / 公益拨款投票，按持有的徽章 NFT 加权 | 治理 / 透明度 |
| **公益 receipt** | 给非营利组织一个工具：每笔捐赠自动 mint 一个不可转移的 NFT 收据，永久可查 | 叠加 Wellspring / Social Good |
| **演唱会/活动门票** | 票 = 不可转移的 NFT，出场时手机签名验证 | 防黄牛 |

## 评审 Tips

- **MLH 评审**=技术 + 创意 + "用没用到 Solana 的特性"。Demo 里要有"链上交易已确认"的截图（用 [Solana Explorer](https://explorer.solana.com/?cluster=devnet) 链接最直观）。
- 全程用 **Devnet** 即可，不要花真钱。
- 不要硬塞 blockchain。如果你的应用用普通数据库就能解决，评委一眼看穿。在 README 写一句"为什么必须用链"。
- Devpost 提交时勾上 "Best Use of Solana"，并贴 program ID / 交易哈希让评委可验证。

## 关键链接

- 官网：[solana.com](https://solana.com/)
- 开发者门户（最重要）：[solana.com/developers](https://solana.com/developers)
- Cookbook（按场景查代码）：[solanacookbook.com](https://solanacookbook.com/)
- Anchor 框架：[anchor-lang.com](https://www.anchor-lang.com/)
- Metaplex（NFT/Token 工具集）：[developers.metaplex.com](https://developers.metaplex.com/)
- 钱包：[Phantom](https://phantom.app/) / [Solflare](https://solflare.com/)
- Devnet 浏览器：[explorer.solana.com](https://explorer.solana.com/?cluster=devnet)
