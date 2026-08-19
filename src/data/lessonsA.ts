import { lesson as L } from "./lesson";
import type { Lesson } from "../types";

export const lessonsA: Record<string, Lesson> = {
  ml: L(
    String.raw`\hat{y} = f_{\theta}(x)`,
    "机器要学的不是一篇作文，而是一套带参数 θ 的函数：看见 x，吐出预测 ŷ。",
    `from sklearn.linear_model import LinearRegression
X = [[30], [50], [80]]          # 面积
y = [80, 120, 200]              # 房价
model = LinearRegression().fit(X, y)
print(model.predict([[60]]))    # 从未见过的 60㎡`,
    "样例：用 3 套房子的面积和价格，让模型猜第 4 套。人不用写“每平米多少钱”，直线自己被数据推出来。",
    "四类问题在工业里的大致占比",
    "监督仍是大头；生成式很火，但很多业务问题其实是回归/分类。",
    "paradigm-bars",
  ),
  supervised: L(
    String.raw`\mathcal{D}=\{(x_i,y_i)\}_{i=1}^{n},\quad \theta^*=\arg\min_\theta \frac{1}{n}\sum_i \ell(f_\theta(x_i),y_i)`,
    "每条样本都有标准答案 y。训练 = 让预测和答案的平均损失尽量小。",
    `from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=0)
clf = RandomForestClassifier().fit(Xtr, ytr)
print(clf.score(Xte, yte))`,
    "样例：邮件向量 X，标签 y=垃圾/正常。模型在训练集上对答案，再用没见过的测试集打分。",
    "两类带标签样本",
    "颜色就是老师给的答案。监督学习的任务：给一颗新点，猜它该涂哪种颜色。",
    "scatter-labeled",
  ),
  unsupervised: L(
    String.raw`\min_{C_1,\dots,C_k} \sum_{j=1}^{k}\sum_{x\in C_j}\|x-\mu_j\|^2`,
    "没有 y。常见目标之一：把点分成几堆，让堆内更像、堆间更不像。",
    `from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print(km.labels_[:10])`,
    "样例：只有用户浏览次数、客单价，没有“这是哪类人”。K-Means 会自己分成几群，运营再给群起名字。",
    "没有颜色的散点",
    "同一张图，拿掉标签后，你只能靠疏密自己看出可能有三团。",
    "scatter-unlabeled",
  ),
  rl: L(
    String.raw`G_t=\sum_{k=0}^{\infty}\gamma^k R_{t+k+1},\quad \pi^*=\arg\max_\pi \mathbb{E}[G\mid\pi]`,
    "回报 G 是未来奖励的折扣和。策略 π 要让期望回报最大。",
    `import numpy as np
Q = np.zeros((n_states, n_actions))
for _ in range(2000):
    s, a = env.reset(), env.act_eps_greedy(Q)
    r, s2 = env.step(a)
    Q[s,a] += 0.1 * (r + 0.95*Q[s2].max() - Q[s,a])`,
    "样例：走迷宫。撞墙 -1，到出口 +10。智能体一开始乱撞，Q 表慢慢记住“哪一步更值钱”。",
    "训练过程中的累计奖励",
    "横轴是回合。曲线往上爬，说明策略从乱试变成会拿分。",
    "reward",
  ),
  generative: L(
    String.raw`x_{\text{new}} \sim p_\theta(x)\quad \text{或}\quad x\sim p_\theta(x\mid c)`,
    "判别模型学 p(y|x)；生成模型学数据本身怎么来，或按条件 c 再采样。",
    `import torch
z = torch.randn(1, 128)
fake_image = generator(z)          # GAN / 扩散的采样入口
text = llm.generate("写一句春天")  # 语言模型也是生成`,
    "样例：只给噪声向量 z，生成器画出一张“像人脸但世界上不存在”的脸；LLM 则按提示续写句子。",
    "真实点与生成点叠在一起",
    "绿色偏真实分布，金色偏模型造出来的。越重合，生成越像那么回事。",
    "generate",
  ),
  "feature-label": L(
    String.raw`x\in\mathbb{R}^{d},\quad y\in\mathbb{R}\ \text{或}\ y\in\{1,\dots,K\}`,
    "x 是特征（模型看见的），y 是标签（希望猜中的）。d 是特征有几维。",
    `import pandas as pd
df = pd.DataFrame({"面积":[60,90], "楼龄":[5,20], "房价":[180,210]})
X, y = df[["面积","楼龄"]], df["房价"]`,
    "样例：面积、楼龄是特征；房价是标签。若误把房价也放进 X，模型等于作弊看答案。",
    "特征 x 与标签 y 的散点",
    "横轴一个特征，纵轴标签。监督学习就是在这张图上拟合关系。",
    "xy-table",
  ),
  loss: L(
    String.raw`L(\theta)=\frac{1}{n}\sum_{i=1}^{n}\ell(\hat{y}_i,y_i),\quad \ell_{\text{MSE}}=( \hat{y}-y)^2`,
    "损失把“错多少”收成一个数。回归常用平方误差，分类常用交叉熵。",
    `import numpy as np
y, yhat = np.array([1.0, 2.0]), np.array([1.2, 1.5])
mse = ((yhat - y)**2).mean()
print(mse)`,
    "样例：真实体重 70kg，模型猜 76kg，平方损失是 36。训练就是把这种数字往下压。",
    "参数与损失：一只碗",
    "碗底就是最不那么错的参数。梯度下降顺着碗壁往下走。",
    "loss-bowl",
  ),
  gd: L(
    String.raw`\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t)`,
    "η 是学习率。梯度指出升得最快的方向，减号表示反着走、去降损失。",
    `w, eta = 2.5, 0.1
for step in range(20):
    grad = 2 * w          # L = w^2 的导数
    w -= eta * grad
print(w)`,
    "样例：从 w=2.5 出发，每步减 0.1×梯度，二十步后会靠近 0，也就是这只抛物线碗的底。",
    "下山轨迹",
    "金色点是每一步的位置。步子别太大，否则会在谷底两侧来回蹦。",
    "gd-path",
  ),
  sgd: L(
    String.raw`\theta\leftarrow\theta-\eta\nabla_\theta \ell(x_b,y_b),\quad b\sim\text{mini-batch}`,
    "每次只用一小批样本估梯度，快，但曲线会抖。",
    `for xb, yb in dataloader:          # 每批 32 条
    loss = criterion(model(xb), yb)
    loss.backward()
    opt.step(); opt.zero_grad()`,
    "样例：100 万张图不可能每步都看完。SGD 每次抽 32 张估个方向，一天能走很多步。",
    "GD 平滑，SGD 带噪声",
    "噪声不是事故：小抖动有时能帮你逃出糟糕的局部坑。",
    "sgd-noise",
  ),
  backprop: L(
    String.raw`\frac{\partial L}{\partial w^{(l)}}=\frac{\partial L}{\partial a^{(l)}}\frac{\partial a^{(l)}}{\partial z^{(l)}}\frac{\partial z^{(l)}}{\partial w^{(l)}}`,
    "链式法则从最后一层往回传，每一层的“责任”都能算出来。",
    `loss = ((model(x) - y)**2).mean()
loss.backward()                 # 自动把各层 .grad 填好
print(model[0].weight.grad.norm())`,
    "样例：三层网络预测房价偏了。反向传播会告诉你：输出层错得多，第一层可能只该轻轻改。",
    "各层梯度幅度",
    "越浅的层梯度往往越小。太小就会“学不动”，这是深层网络要小心的。",
    "grad-layers",
  ),
  "lr-rate": L(
    String.raw`\eta_t=\eta_0\cdot \gamma^{t}\quad \text{或余弦退火}`,
    "学习率是步长。太大发散，太小学成蜗牛，常常还要随时间变小。",
    `for epoch in range(100):
    eta = 0.1 * (0.95 ** epoch)
    for p in model.parameters():
        p.data -= eta * p.grad`,
    "样例：同样的线性回归，η=1 损失乱跳；η=1e-6 一小时没动；η=0.05 二十步就贴合。",
    "三种学习率的损失曲线",
    "红色来回荡是太大；灰色几乎不降是太小；绿色才是能收敛的步长。",
    "lr-three",
  ),
  regularization: L(
    String.raw`L_{\text{reg}}=L_{\text{data}}+\lambda\|\theta\|_p^{p}`,
    "λ 越大，越不许参数长得夸张。p=2 是岭，p=1 是 Lasso。",
    `from sklearn.linear_model import Ridge
Ridge(alpha=1.0).fit(X, y)      # alpha 就是 λ`,
    "样例：特征里有“面积”和“平方公尺”（同一回事）。不加正则，两个系数会疯涨对冲；加上后都被压小。",
    "正则把过大的权重按回去",
    "深色是原始系数，绿色是加了 L2 之后。模型变简单，换批数据就不那么跳。",
    "l2-shrink",
  ),
  overfit: L(
    String.raw`R_{\text{true}}(f)\;\gg\;R_{\text{train}}(f)`,
    "训练集损失已经很低，真实风险却很高：背题了。欠拟合则是两边都高。",
    `print("train", model.score(Xtr, ytr))
print("val  ", model.score(Xva, yva))
# 若 train=0.99 而 val=0.61，就是过拟合信号`,
    "样例：20 个点用 15 次多项式，训练点点过，新点却飞到天外。换 2 次多项式反而更稳。",
    "训练曲线继续降，验证曲线掉头",
    "分叉点之后再训练，只是在背训练集。该早停或加正则。",
    "overfit-curves",
  ),
  "bias-variance": L(
    String.raw`\mathbb{E}[(y-\hat{f})^2]=\text{Bias}^2+\text{Var}+\sigma^2`,
    "误差拆成：系统性想偏、换数据就抖、再加上不可消的噪声。",
    `# 偏差高：换线性模型 → 多项式 / 树
# 方差高：加数据、剪枝、Bagging、加大正则`,
    "样例：用一条水平线猜房价，永远偏低或偏高（偏差）；用极深的树，换一批小区答案就变（方差）。",
    "三种误差来源的示意",
    "折中不是口号：随机森林降方差，简单线性模型往往偏差更高但更稳。",
    "bias-var",
  ),
  "feature-eng": L(
    String.raw`x'=\phi(x)\quad \text{例如}\ x_{\text{单价}}=x_{\text{总价}}/x_{\text{面积}}`,
    "φ 是你设计的变换：比值、分箱、交叉、时间差，让模型更好啃。",
    `df["房龄"] = 2026 - df["建成"]
df["单位面积"] = df["总价"] / df["面积"]
df["周末"] = df["日期"].dt.dayofweek >= 5`,
    "样例：预测用电，原始“时刻”不如拆成小时、是否周末、是否高温。树模型会感谢你。",
    "未缩放时一个特征会碾压另一个",
    "若横轴是收入（上万）、纵轴是年龄（几十），距离类算法会只看见收入。",
    "feature-scale",
  ),
  normalize: L(
    String.raw`z=\frac{x-\mu}{\sigma}\quad \text{或}\quad x'=\frac{x-x_{\min}}{x_{\max}-x_{\min}}`,
    "标准化拉到均值 0 方差 1；归一化拉到 0–1。尺子必须来自训练集。",
    `from sklearn.preprocessing import StandardScaler
sc = StandardScaler().fit(Xtr)
Xtr2, Xte2 = sc.transform(Xtr), sc.transform(Xte)`,
    "样例：KNN 里身高 cm 和体重 kg 混用。不标准化，“差 10cm”和“差 10kg”不可比。",
    "标准化之后的钟形",
    "多数算法假设各维尺度相近。树模型通常不需要这一步。",
    "zscore",
  ),
  split: L(
    String.raw`\mathcal{D}=\mathcal{D}_{\text{train}}\cup\mathcal{D}_{\text{val}}\cup\mathcal{D}_{\text{test}}`,
    "训练学、验证调、测试只打一次最终分。测试集不能回流到调参里。",
    `Xtr, Xtmp, ytr, ytmp = train_test_split(X, y, test_size=0.3, random_state=0)
Xva, Xte, yva, yte = train_test_split(Xtmp, ytmp, test_size=0.5, random_state=0)`,
    "样例：1000 封邮件：700 训练、150 选模型、150 高考。若用高考卷调参，分数立刻虚高。",
    "一次典型划分",
    "验证可以反复用；测试集是封印，只在最后揭晓。",
    "split-bars",
  ),
  cv: L(
    String.raw`\text{CV}=\frac{1}{K}\sum_{k=1}^{K} R(f^{-k};\mathcal{D}_k)`,
    "K 折：每次留一份当考卷，其余当练习，最后平均，分数更稳。",
    `from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(scores.mean(), scores.std())`,
    "样例：只有 200 个病人。一次随机划分可能碰巧简单。5 折交叉验证会把运气平均掉。",
    "5 折轮流当测试",
    "金色格子表示这一折被留作考试，其余用来训练。",
    "cv-folds",
  ),
  "sliding-window": L(
    String.raw`x_t^{(w)}=(x_{t-w+1},\dots,x_t)\ \rightarrow\ y=x_{t+h}`,
    "用过去 w 步组成一个向量，去预测未来 h 步。窗口不断右移。",
    `w, h = 7, 1
Xs, ys = [], []
for t in range(w, len(series)-h+1):
    Xs.append(series[t-w:t]); ys.append(series[t+h-1])`,
    "样例：用过去 7 天用电，预测明天。每一天都形成一个新样本，窗口往前滑一天。",
    "原序列与窗口平滑",
    "窗口太短看不见趋势，太长会把过期信息也平均进去。",
    "sliding",
  ),
  augment: L(
    String.raw`x' = T(x),\quad y'=y\quad (T\text{须保持语义})`,
    "T 是翻转、裁剪、加噪等。标签必须仍然成立，否则就是在教错。",
    `from torchvision import transforms
T = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2),
])
img2 = T(img)`,
    "样例：同一只猫左右翻转仍是猫；但把“6”旋转 180° 变成“9”，标签就不能跟着随便留。",
    "原点与增强后的散布",
    "绿色是原始少数点，金色是增强出来的邻域，模型因此不那么死记某几张图。",
    "augment",
  ),
  regression: L(
    String.raw`y\in\mathbb{R},\quad \hat{y}=f(x)`,
    "答案是连续数：价格、温度、时长。差 1 和差 100 的严重程度不同。",
    `from sklearn.metrics import mean_absolute_error
pred = model.predict(Xte)
print("MAE", mean_absolute_error(yte, pred), "万元")`,
    "样例：猜房价 320 万，真实 300 万，错 20 万。分类问题不会这样谈“错多少钱”。",
    "连续标签随特征变化",
    "点越贴近某条趋势，越适合先用回归家族开刀。",
    "reg-family",
  ),
  linreg: L(
    String.raw`\hat{y}=w^\top x+b,\quad \hat{w}=(X^\top X)^{-1}X^\top y`,
    "每个特征一个权重再相加。右边是最小二乘的闭式解（也可用梯度下降）。",
    `from sklearn.linear_model import LinearRegression
m = LinearRegression().fit(X, y)
print(m.coef_, m.intercept_)
print("面积每多 1㎡，房价约 +", m.coef_[0])`,
    "样例：ŷ = 2.1×面积 + 15。面积 80㎡ 时预测 183。系数能直接讲给业务听。",
    "最小二乘拟合直线",
    "直线不必穿过每个点，只要让竖直方向的平方误差之和最小。",
    "linreg",
  ),
  polyreg: L(
    String.raw`\hat{y}=w_0+w_1x+w_2x^2+\cdots+w_p x^p`,
    "对 x 做多项式展开后，仍然用线性回归学系数。p 太大就会过拟合。",
    `from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
pipe = make_pipeline(PolynomialFeatures(3), LinearRegression())
pipe.fit(X, y)`,
    "样例：销量随折扣先升后降。一次直线贴不住，三次曲线可以，三十次就会跟着噪声乱扭。",
    "弯曲趋势用多项式贴合",
    "这仍叫线性模型：对系数是线性的，对原始 x 可以是弯的。",
    "poly",
  ),
  ridge: L(
    String.raw`\hat{w}=\arg\min_w \|Xw-y\|^2+\lambda\|w\|_2^2`,
    "在最小二乘上加 L2 惩罚，共线特征时系数不会炸。",
    `from sklearn.linear_model import RidgeCV
m = RidgeCV(alphas=[0.1, 1, 10]).fit(X, y)
print("选中的 λ", m.alpha_)`,
    "样例：面积和“套内面积”高度相关。普通最小二乘系数正负对冲；Ridge 把两边都缩小。",
    "有正则后预测更稳",
    "红色是无正则在不同子集上的晃动，绿色是 Ridge，换一批数据不会大变脸。",
    "ridge",
  ),
  lasso: L(
    String.raw`\hat{w}=\arg\min_w \|Xw-y\|^2+\lambda\|w\|_1`,
    "L1 会把不重要的系数压成精确的 0，等于自动选特征。",
    `from sklearn.linear_model import Lasso
m = Lasso(alpha=0.1).fit(X, y)
print([name for name,w in zip(cols, m.coef_) if abs(w)>1e-8])`,
    "样例：20 个房屋特征里，Lasso 只留下面积、地段、楼龄，朝向和噪声项变成 0。",
    "Lasso 之后的系数",
    "高度为 0 的柱子就是被踢出公式的特征，解释起来更短。",
    "lasso-coef",
  ),
  classification: L(
    String.raw`y\in\{1,\dots,K\},\quad \hat{y}=\arg\max_k p(y=k\mid x)`,
    "答案是类别。模型往往先输出各类概率，再取最大的那个。",
    `from sklearn.metrics import classification_report
print(classification_report(yte, clf.predict(Xte)))`,
    "样例：肿瘤良性/恶性。不能只看准确率：把所有人都判良性，准确率也可能很高。",
    "两类之间的决策边界",
    "线的一侧是 A 类，另一侧是 B 类。不同算法画出的边界形状不同。",
    "class-blobs",
  ),
  logreg: L(
    String.raw`p(y=1\mid x)=\sigma(w^\top x+b),\quad \sigma(z)=\frac{1}{1+e^{-z}}`,
    "先线性打分，再挤到 0–1 当概率。名字叫回归，活是分类。",
    `from sklearn.linear_model import LogisticRegression
m = LogisticRegression().fit(X, y)
print(m.predict_proba([[2.0, 1.1]]))  # 属于两类的概率`,
    "样例：信用评分。分数高 → σ 接近 1 → 判违约概率高，可以按 0.3/0.7 不同阈值拦人。",
    "Sigmoid 把任意分数变成概率",
    "中间最陡，两端饱和。这就是逻辑回归输出为什么总在 0 和 1 之间。",
    "sigmoid",
  ),
  knn: L(
    String.raw`\hat{y}(x)=\mathrm{mode}\{y_i: i\in N_k(x)\}`,
    "在特征空间里找最近的 k 个邻居，投票。没有显式训练公式。",
    `from sklearn.neighbors import KNeighborsClassifier
KNeighborsClassifier(n_neighbors=5).fit(Xtr, ytr).predict(Xte)`,
    "样例：新客户特征落在老客户堆里。k=1 太敏感，k=5 更稳。记得先标准化。",
    "新点（金）看邻居颜色",
    "周围绿多就判绿。k 要奇数可减少平票；维度太高时远近会失效。",
    "knn",
  ),
  svm: L(
    String.raw`\min_{w,b}\frac{1}{2}\|w\|^2+C\sum_i\xi_i\quad\text{s.t.}\ y_i(w^\top x_i+b)\ge 1-\xi_i`,
    "找最宽的隔离带。真正起作用的是贴着边界的支持向量。",
    `from sklearn.svm import SVC
SVC(kernel="rbf", C=1.0, gamma="scale").fit(X, y)`,
    "样例：两类点分得很开时，中间那条最宽的走廊就是 SVM 的几何直觉。C 越大越不许人越界。",
    "决策边界与两侧间隔",
    "三条线中间那条是分界，上下是间隔。被夹在间隔上的点就是支持向量。",
    "svm",
  ),
  dt: L(
    String.raw`\text{分裂点}=\arg\max_{j,t}\ \Delta I(j,t)`,
    "每次选一个特征阈值，让分完后“更纯”（信息增益 / Gini）。",
    `from sklearn.tree import DecisionTreeClassifier, export_text
t = DecisionTreeClassifier(max_depth=3).fit(X, y)
print(export_text(t, feature_names=cols))`,
    "样例：先问收入是否>12 万，再问是否有房，得到可否放贷。深度 3 的树可以画给风控看。",
    "轴对齐的切分",
    "决策树的边界是横竖切的，像在地图上用直尺划分街区。",
    "tree",
  ),
  nb: L(
    String.raw`p(y\mid x)\propto p(y)\prod_j p(x_j\mid y)`,
    "假装特征条件独立，把贝叶斯公式乘开。朴素，但邮件分类经常好用。",
    `from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
X = CountVectorizer().fit_transform(emails)
MultinomialNB().fit(X, y)`,
    "样例：一封信同时出现“发票”“中奖”。垃圾类下这些词的概率高，乘起来后垃圾类胜出。",
    "两类词频的分布",
    "横轴像某个词出现次数。两团分开越多，朴素贝叶斯越好判。",
    "nb-hist",
  ),
};
