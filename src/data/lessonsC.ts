import { lesson as L } from "./lesson";
import type { Lesson } from "../types";

export const lessonsC: Record<string, Lesson> = {
  perceptron: L(
    String.raw`\hat{y}=\mathrm{sign}(w^\top x+b),\quad w\leftarrow w+y x\ \text{if misclassified}`,
    "加权求和过门槛。分错就沿样本方向推一把权重。只能切开线性可分的数据。",
    `w = np.zeros(d)
for x, y in data:                 # y = ±1
    if y * (w @ x) <= 0:
        w += y * x`,
    "样例：两个特征完全能用一条直线分开时，感知机会停。XOR（斜对角同类）它永远学不会。",
    "线性可分时的分界",
    "单层感知机是神经网络的化石。多层加上非线性，才打开深度学习。",
    "perceptron",
  ),
  mlp: L(
    String.raw`h=\sigma(W_1 x+b_1),\quad \hat{y}=W_2 h+b_2`,
    "全连接层叠起来，σ 是非线性。没有 σ，一百层也还是一个线性模型。",
    `import torch.nn as nn
mlp = nn.Sequential(
    nn.Linear(10, 64), nn.ReLU(),
    nn.Linear(64, 64), nn.ReLU(),
    nn.Linear(64, 1),
)`,
    "样例：XOR 四个点，单层直线切不开，两层 MLP 可以。表格数据上它是深度基线，但不懂图像的局部性。",
    "XOR：同类在对角上",
    "必须用弯曲的决策面。这正是激活函数存在的理由。",
    "mlp-xor",
  ),
  activation: L(
    String.raw`\mathrm{ReLU}(z)=\max(0,z),\quad \sigma(z)=\frac{1}{1+e^{-z}}`,
    "激活负责拐弯。ReLU 让深层好训；Sigmoid 容易饱和，多用于最后输出概率。",
    `z = torch.linspace(-3, 3, 7)
print(torch.relu(z))
print(torch.sigmoid(z))`,
    "样例：隐藏层用 Sigmoid，梯度传到前面几乎为 0。换成 ReLU 后，正半轴梯度恒为 1，深层终于能动。",
    "ReLU 与 Sigmoid",
    "ReLU 左边一刀切零；Sigmoid 两端趴平。现代隐藏层更常见 ReLU / GELU。",
    "relu",
  ),
  cnn: L(
    String.raw`(K*X)_{ij}=\sum_{u,v} K_{uv}\, X_{i+u,j+v}`,
    "小卷积核在图上滑动，权值共享。先边缘后零件再物体。",
    `nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(),
)`,
    "样例：3×3 核去找竖边缘。同一套核扫整张照片，左上角的猫眼和右下角的猫眼共享检测器。",
    "特征图：亮处是被核激活的区域",
    "像拿放大镜滑动。这就是滑动窗口在视觉里的深度版本。",
    "cnn",
  ),
  rnn: L(
    String.raw`h_t=\tanh(W_h h_{t-1}+W_x x_t+b)`,
    "一步步读序列，把“读到哪了”塞进隐藏态 h_t 带给下一时刻。",
    `h = torch.zeros(hidden)
for x_t in tokens:
    h = torch.tanh(Wh @ h + Wx @ x_t)`,
    "样例：读“不觉得不好”时，必须把前面的“不”带到后面，否则情感会判反。序列一长，h 会忘或梯度消失。",
    "输入波与延迟的隐藏态",
    "隐藏态像带延迟的回声。长程依赖是 RNN 的痛点，所以有 LSTM 和注意力。",
    "rnn",
  ),
  lstm: L(
    String.raw`c_t=f_t\odot c_{t-1}+i_t\odot \tilde{c}_t,\quad h_t=o_t\odot\tanh(c_t)`,
    "遗忘门 f、输入门 i、输出门 o 决定记什么、忘什么。细胞态 c 是一条更稳的记忆带。",
    `lstm = nn.LSTM(input_size=32, hidden_size=64, batch_first=True)
out, (h, c) = lstm(batch_tokens)`,
    "样例：一段 200 步的传感器。RNN 到后面忘了开头的故障信号；LSTM 可以把那次尖峰一直放在细胞态里。",
    "RNN 遗忘 vs LSTM 保持",
    "红色很快衰减，绿色能把早期事件带到后面。GRU 是更轻的近亲。",
    "lstm",
  ),
  attention: L(
    String.raw`\mathrm{Attn}(Q,K,V)=\mathrm{softmax}\Big(\frac{QK^\top}{\sqrt{d}}\Big)V`,
    "用查询 Q 去对键 K 打分，再按分数加权取值 V。不必一步步传记忆。",
    `score = (Q @ K.T) / d**0.5
w = torch.softmax(score, dim=-1)
out = w @ V`,
    "样例：翻译“bank”时，注意力会看上下文是“河岸”还是“银行”。权重矩阵就是一张谁在看谁的热力图。",
    "词与词之间的注意力权重",
    "对角强：每个词先看自己。偏高的格子表示翻译这个词时还在盯着另一个词。",
    "attention",
  ),
  transformer: L(
    String.raw`x\leftarrow x+\mathrm{Attn}(x),\quad x\leftarrow x+\mathrm{FFN}(x)`,
    "自注意力加前馈，再加残差和 LayerNorm。可并行，是大模型骨干。",
    `enc = nn.TransformerEncoderLayer(d_model=512, nhead=8)
y = enc(token_emb)`,
    "样例：一句话 20 个 token，注意力让每个位置同时看见其他 19 个，不必等 RNN 从左扫到右。代价是长度平方的计算。",
    "一个块里的四件套",
    "注意力负责找关系，前馈负责逐点变换，残差和 Norm 负责让它堆得深。",
    "transformer",
  ),
  resnet: L(
    String.raw`y=x+F(x)`,
    "F 只学残差（修正项），x 从旁路直达。深度从“训崩”变成“可以到 100+ 层”。",
    `class Block(nn.Module):
    def forward(self, x):
        return x + self.conv2(self.relu(self.conv1(x)))`,
    "样例：18 层 CNN 加深到 56 层，准确率反而掉。加上残差后，56 层超过 18 层——优化通路被打通了。",
    "加深之后：有残差才继续涨点",
    "残差不是新识别原理，是让梯度有一条高速公路。Transformer 里同样在用。",
    "residual",
  ),
  ae: L(
    String.raw`z=\mathrm{Enc}(x),\quad \hat{x}=\mathrm{Dec}(z),\quad L=\|x-\hat{x}\|^2`,
    "压成短码再还原。中间 z 就是学到的压缩表示；还原不好的点常是异常。",
    `z = encoder(x)
xhat = decoder(z)
loss = ((x - xhat)**2).mean()`,
    "样例：正常机器振动能被 8 维码重建；轴承损坏的波形重建误差突然变大，于是报警。",
    "丢掉高频细节后的重建",
    "蓝是原信号，金是重建。差得离谱的样本，往往值得拿去当异常。",
    "autoencoder",
  ),
  gan: L(
    String.raw`\min_G\max_D \mathbb{E}_{x}[\log D(x)]+\mathbb{E}_{z}[\log(1-D(G(z)))]`,
    "D 鉴假，G 造假。均衡时 D 分不清真假。训练很容易抖。",
    `d_loss = -log(D(real)) - log(1 - D(G(z).detach()))
g_loss = -log(D(G(z)))`,
    "样例：生成手写数字。早期全是噪声，对抗几十个 epoch 后出现能认的“3”。模式崩塌时会只会画同一种 3。",
    "对抗双方的损失",
    "两条线拉锯是常态。今天很多生成任务已被更稳的扩散模型抢走。",
    "gan",
  ),
  diffusion: L(
    String.raw`x_t=\sqrt{\bar{\alpha}_t}x_0+\sqrt{1-\bar{\alpha}_t}\epsilon,\quad \epsilon_\theta(x_t,t)\approx\epsilon`,
    "正向把图加噪毁掉，网络学预测噪声；生成就是从纯噪声一步步走回来。",
    `noise = torch.randn_like(x)
xt = sqrt_ab[t]*x + sqrt_om[t]*noise
pred = unet(xt, t)
loss = ((pred - noise)**2).mean()`,
    "样例：文生图。提示“一只红狐狸”作为条件，从高斯噪声去噪 30 步，狐狸轮廓逐渐浮现。",
    "加噪过程：可辨认度下降",
    "采样步数多就更清晰也更慢。工程上会用蒸馏换速度。",
    "diffusion",
  ),
  gnn: L(
    String.raw`h_i^{(l+1)}=\sigma\Big(W \sum_{j\in\mathcal{N}(i)\cup\{i\}} \frac{h_j^{(l)}}{c_{ij}}\Big)`,
    "每个点从邻居汇聚信息。关系就是数据：用户-商品、原子-键、路口-道路。",
    `h = node_emb
for _ in range(2):
    h = relu(A_norm @ h @ W)     # A 是邻接`,
    "样例：推荐。用户和点过的商品连边，两层 GNN 后，用户向量会带上邻居商品的味道，再去匹配没点过的。",
    "一次邻居聚合的权重",
    "图构建错了（乱连边），模型再巧也是在学错误关系。",
    "gnn",
  ),
  embedding: L(
    String.raw`e_i\in\mathbb{R}^{d},\quad \cos(e_i,e_j)=\frac{e_i^\top e_j}{\|e_i\|\|e_j\|}`,
    "把词/用户/句子变成向量，近义的在空间里靠近。是检索和语言模型的第一层。",
    `emb = nn.Embedding(vocab_size, 256)
vec = emb(token_ids)             # [B, T, 256]
sim = F.cosine_similarity(q, docs, dim=-1)`,
    "样例：“国王”靠近“王后”，远离“香蕉”。RAG 里用这句话的向量去知识库里找最近的段落。",
    "二维语义地图（示意）",
    "同色近邻是一类词。嵌入质量取决于怎么训练，不是有了向量就等于懂语义。",
    "embed",
  ),
  optimizer: L(
    String.raw`m_t=\beta_1 m_{t-1}+(1-\beta_1)g_t,\quad v_t=\beta_2 v_{t-1}+(1-\beta_2)g_t^2,\quad \theta\leftarrow\theta-\eta\frac{m}{\sqrt{v}+\epsilon}`,
    "Adam：动量 + 自适应学习率。SGD+动量在大模型预训练里也仍常见。",
    `opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
opt.zero_grad(); loss.backward(); opt.step()`,
    "样例：同一 MLP，SGD 要小心调学习率才降得动；Adam 默认 3e-4 往往就能开训。换优化器后学习率要重调。",
    "Adam 通常比朴素 SGD 降得快",
    "没有永远的默认王者。大 batch、大模型上有人仍爱 SGD。",
    "optim",
  ),
  bn: L(
    String.raw`\hat{x}=\frac{x-\mu_B}{\sqrt{\sigma_B^2+\epsilon}},\quad y=\gamma\hat{x}+\beta`,
    "BatchNorm 用当前批的均值方差拉回；Transformer 更爱 LayerNorm（按每个样本的层内统计）。",
    `nn.Sequential(nn.Linear(128,128), nn.BatchNorm1d(128), nn.ReLU())
# 语言模型：nn.LayerNorm(d_model)`,
    "样例：深层激活整体漂到 +10，ReLU 还好，Sigmoid 就全饱和。BN 把它拉回 0 附近，学习率可以更大。",
    "分布被拉回零附近",
    "小 batch 时 BN 统计不稳。这就是 NLP 爱 LayerNorm 的原因之一。",
    "batchnorm",
  ),
  dropout: L(
    String.raw`\tilde{h}=m\odot h,\quad m\sim\mathrm{Bernoulli}(p)`,
    "训练时随机掐掉一些单元，逼网络别死记某几条通路。推理时关闭。",
    `self.drop = nn.Dropout(0.3)
h = self.drop(self.fc(h))        # 仅 training=True 时生效`,
    "样例：全连接层 512 维，p=0.3 意味着每次大约 30% 神经元放假。换一批样本，放假的人不同，相当于集成。",
    "某次训练中被掐掉的单元",
    "高度为 0 的是本轮被 mask 的。现代大模型更常用权重衰减，Dropout 不再唯一。",
    "dropout",
  ),
  pretrain: L(
    String.raw`\theta_{\text{pre}}=\arg\min_\theta \mathbb{E}_{x\sim\mathcal{D}_{\text{huge}}}\ell_{\text{self}}(x;\theta)`,
    "在海量数据上做自监督功课（下一词、掩码重建、对比学习），先学通用表示。",
    `# 语言模型：预测下一个 token
loss = cross_entropy(logits[:, :-1], tokens[:, 1:])`,
    "样例：BERT 在维基上填空，GPT 在网页上预测下一词。下游只有 500 条医疗数据时，也比从零训强得多。",
    "从零训 vs 预训练再微调",
    "金色起点更高、爬得更快。预训练目标决定它擅长什么。",
    "pretrain",
  ),
  transfer: L(
    String.raw`\theta_{\text{down}}=\arg\min_\theta L_{\text{task}}(\theta),\quad \theta\leftarrow\theta_{\text{pre}}`,
    "把 A 任务的参数当初始化，去干相近的 B。领域差太远会负迁移。",
    `model = models.resnet50(weights="IMAGENET1K_V2")
model.fc = nn.Linear(2048, 2)     # 改成猫狗
# 先冻前面几层，只训最后一层`,
    "样例：ImageNet 预训练的 ResNet 去认工业零件缺陷。前面的边缘检测仍然有用，只需换最后的分类头。",
    "源任务能力能搬走多少",
    "直接搬有时只有 55 分；微调后回到 88。差太远会变成偏见。",
    "transfer",
  ),
  "early-stop": L(
    String.raw`t^*=\arg\min_t R_{\text{val}}(f_t)`,
    "验证集不再变好就停。最便宜的正则：用时间当惩罚。",
    `best, wait = 1e9, 0
for epoch in range(200):
    val = evaluate(model, val_loader)
    if val < best: best, wait = val, 0; save(model)
    else:
        wait += 1
        if wait == 10: break`,
    "样例：第 16 轮验证误差最低，之后训练还在降、验证却升。保存第 16 轮的权重，不要用第 40 轮。",
    "验证曲线最低点就是该停的地方",
    "验证集太小，这个点会抖。仍要留真正的测试集做最终评价。",
    "earlystop",
  ),
  tokenizer: L(
    String.raw`\text{text}\xrightarrow{\text{BPE / Unigram}} (t_1,\dots,t_n),\ t_i\in\{1,\dots,|V|\}`,
    "模型不看“字”，看 token 编号。中文常常 1–2 字一块；计费和长度都按这个数。",
    `from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B")
ids = tok("机器学习很有趣")
print(ids, len(ids["input_ids"]))`,
    "样例：同一句中文，不同模型切出来的块数不同。上下文“8k”不是 8000 个汉字，是 8000 个 token。",
    "一句被切成几块",
    "柱高示意块数。词表和切法会显著影响中文效率。",
    "tokenize",
  ),
  context: L(
    String.raw`n\le C,\quad C\in\{4\mathrm{k},8\mathrm{k},128\mathrm{k},\dots\}`,
    "一次最多看见 C 个 token。超出的等于没看见。更大窗口也不保证中间内容被用上。",
    `ids = tok(prompt + docs + question).input_ids
assert len(ids) < model.config.max_position_embeddings`,
    "样例：把 3 本手册全贴进提示，第 1 本被挤出窗口，模型便“没听说过”其中条款。先检索再贴更靠谱。",
    "窗口里已用 vs 剩余",
    "书桌就这么大。材料堆满，最早放的会被挤到地上。",
    "context",
  ),
  sft: L(
    String.raw`\min_\theta \sum_{(x,y)\in\mathcal{D}_{\text{inst}}} -\log p_\theta(y\mid x)`,
    "用指令-回答对继续最大似然，改动几乎所有参数，让基座学会听指令。",
    `loss = -log_prob_of_answer_tokens  # 只在答案段计损失
loss.backward()`,
    "样例：基座只会冷冰冰续写网页。SFT 喂一万条“用户/助手”对话后，它开始按格式回答，但也可能把原来的知识训丢。",
    "指令微调的损失下降",
    "全量微调上限高，也更贵、更容易灾难性遗忘。",
    "sft",
  ),
  lora: L(
    String.raw`W'=W+\frac{\alpha}{r}BA,\quad B\in\mathbb{R}^{d\times r},A\in\mathbb{R}^{r\times k}`,
    "冻住原矩阵 W，只训两个小矩阵。r 很小，参数量可以是千分之几。",
    `from peft import LoraConfig, get_peft_model
cfg = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj","v_proj"])
model = get_peft_model(base, cfg)`,
    "样例：7B 模型全量微调要很多张 GPU。LoRA r=8 一张消费级卡也能把客服口吻训进去，还能按任务换适配器。",
    "可训练参数量对比",
    "便利贴 vs 改教科书。任务极难时 LoRA 可能不够，但多数定制它是第一选择。",
    "lora",
  ),
  prompt: L(
    String.raw`y\sim p_\theta(\cdot\mid \underbrace{r,e_1,y_1,\dots,e_k,y_k}_{\text{提示}},x)`,
    "不改参数，只改怎么问：角色、规则、少样本例子、输出格式。",
    `prompt = """你是发票助手。只输出 JSON。
例子：{"税额": 12.3}
现在：这张票税额是多少？"""`,
    "样例：空喊“请专业”不如贴两个 JSON 例子。换模型版本后同一套话术可能突然失灵，所以提示也要回归测试。",
    "零样本 / 少样本 / 思维链",
    "给例子和让它写出推理步骤，往往比只换形容词更有效。",
    "prompt",
  ),
  rag: L(
    String.raw`\hat{y}=p_\theta(y\mid x, \mathrm{Retrieve}(x))`,
    "先从知识库找出相关段落，再让模型看着段落生成。检索差，生成再强也救不了。",
    `q = embed(question)
idx = nearest(q, doc_vecs, k=5)
answer = llm(question + "\n" + "\n".join(docs[idx]))`,
    "样例：问“今年差旅标准”。模型自己记的是旧制度；RAG 把最新 PDF 片段贴进去，答案才能带得动条款号。",
    "只靠参数记忆 vs 开卷",
    "很多幻觉其实是没检索到。引用原文还能让人核对。",
    "rag",
  ),
  rlhf: L(
    String.raw`\max_\pi \mathbb{E}[r_\phi(x,y)]-\beta\,\mathrm{KL}(\pi\|\pi_{\text{SFT}})`,
    "奖励模型 r 学人的偏好，再用 PPO/DPO 一类方法让策略更有用、更无害，同时别离 SFT 太远。",
    `# DPO 直觉：提高“人更喜欢的回答”的相对对数概率
loss = -log_sigmoid(beta * (logp_win - logp_lose))`,
    "样例：同一问题两个回答，标注员点“更礼貌且不编造”的那个。训练后模型更像助手，而不是网页续写器。",
    "有用性上升，有害输出下降",
    "对齐会改行为，也可能削掉某些能力。偏好数据自带价值观。",
    "rlhf",
  ),
  hallucination: L(
    String.raw`p_\theta(\tilde{y}\mid x)\ \text{高},\ \tilde{y}\ \text{却与事实不符}`,
    "优化目标是“像人话”，不是保证真。听起来稳的句子也可以是编的。",
    `# 缓解：检索、要求引用、低温、对数字做工具校验
if not evidence_supports(claim):
    refuse_or_cite()`,
    "样例：问冷门论文年份，模型给出一个不存在的 DOI，语气却很确定。更大的模型也会这样，不是小模型专属。",
    "幻觉率随护栏下降",
    "检索 + 强制引用是工程上最有效的组合之一。高风险场景还要人审。",
    "halluc",
  ),
  metrics: L(
    String.raw`\mathrm{Acc}=\frac{TP+TN}{N},\ \mathrm{P}=\frac{TP}{TP+FP},\ \mathrm{R}=\frac{TP}{TP+FN}`,
    "准确率看总体；精确率看报阳里有多少真的；召回率看真阳抓回多少。",
    `from sklearn.metrics import precision_recall_fscore_support
p, r, f, _ = precision_recall_fscore_support(y, pred, average="binary")`,
    "样例：1000 人里 20 个患病。全判健康准确率 98%，召回率 0。医疗更怕漏诊，必须把召回率单独拿出来。",
    "不平衡时准确率会骗人",
    "灰色准确率很高，金色精确率一般，绿色召回才是这个业务要的。",
    "metrics",
  ),
  confusion: L(
    String.raw`\begin{bmatrix}TN & FP\\ FN & TP\end{bmatrix}`,
    "谁被认成了谁。比一个总分更有诊断价值。",
    `from sklearn.metrics import confusion_matrix
print(confusion_matrix(y, pred, labels=[0,1]))`,
    "样例：猫狗分类。若 10 只猫被认成狗，说明模型可能对毛色有偏见。下一步去翻这 10 张图，而不是只调学习率。",
    "2×2 混淆矩阵",
    "左上真负、右下真正。右上是误报，左下是漏报。先问业务更怕哪一个。",
    "confusion",
  ),
  auc: L(
    String.raw`\mathrm{AUC}=\Pr(\hat{s}_+\gt \hat{s}_-)`,
    "不先定阈值，看正样本分数排在负样本前面的概率。越近 1 越好。",
    `from sklearn.metrics import roc_auc_score, RocCurveDisplay
print(roc_auc_score(y, proba))`,
    "样例：风控输出违约概率。阈值今天 0.3 明天 0.5，AUC 仍能比较“排序能力”。极度不平衡时再看 PR 曲线。",
    "ROC：横轴假阳，纵轴真阳",
    "对角线是瞎猜。曲线越弓向左上，模型越能把正负样本排开。",
    "roc",
  ),
  mlops: L(
    String.raw`p_t(x)\ne p_0(x)\ \text{或}\ p_t(y\mid x)\ne p_0(y\mid x)`,
    "数据会变（漂移）。线下分数只是快照，线上要监控、重训、对齐特征。",
    `if psi(prod_feature, train_feature) > 0.2:
    alert("特征漂移，准备重训")`,
    "样例：欺诈模型上线时 AUC 0.84。半年后黑产换手法，线上掉到 0.72，特征分布已经和训练时不是同一世界。",
    "线下分数不动，线上在掉",
    "地图印好了路却在修。持续服务的模型需要版本、监控和回滚，而不是只交实验报告。",
    "drift",
  ),
};
