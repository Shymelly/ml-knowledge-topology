import { lesson as L } from "./lesson";
import type { Lesson } from "../types";

export const lessonsB: Record<string, Lesson> = {
  "bayes-infer": L(
    String.raw`p(\theta\mid x)=\frac{p(x\mid\theta)\,p(\theta)}{p(x)}`,
    "先验 p(θ) 是你本来的看法，似然是数据的发言，后验是更新后的信念。",
    `import numpy as np
prior = np.array([0.5, 0.5])              # 两枚硬币哪枚不公
lik = np.array([0.5**8, 0.8**8])          # 看到 8 次正面
post = prior * lik; post /= post.sum()
print("不公硬币的后验", post[1])`,
    "样例：你先验觉得两枚硬币一半一半。连抛 8 次都正面后，后验会强烈偏向“这枚不公”。",
    "先验被数据推到后验",
    "灰色是原来的信念，金色是看到数据之后。贝叶斯的产品是整条分布，不只一个点。",
    "bayes-update",
  ),
  "bayes-net": L(
    String.raw`p(x_1,\dots,x_n)=\prod_i p(x_i\mid \mathrm{Pa}(x_i))`,
    "每个变量只依赖图上的父节点。图结构编码了条件独立。",
    `# 雨 → 地湿 → 摔倒
p_slip = (
    p_rain * p_wet_rain * p_slip_wet
    + (1-p_rain) * p_wet_dry * p_slip_wet_dry
)`,
    "样例：看见有人摔倒，想问今天下雨的概率。网络会沿“摔倒←地湿←下雨”反着推理。",
    "一条因果链上的条件概率",
    "把专家知识画成箭头，再填数字，就能问各种“如果观察到 A，B 怎么变”。",
    "bayes-net",
  ),
  gmm: L(
    String.raw`p(x)=\sum_{k=1}^{K}\pi_k\,\mathcal{N}(x\mid\mu_k,\Sigma_k)`,
    "数据是几团高斯的混合物。归属是软的：一个点可以 0.7 像 A、0.3 像 B。",
    `from sklearn.mixture import GaussianMixture
gmm = GaussianMixture(n_components=2).fit(X)
print(gmm.predict_proba(X)[:3])`,
    "样例：身高体重图里男女两团椭圆重叠。GMM 不会一刀切，站在中间的人会给两个概率。",
    "两团椭圆高斯",
    "和 K-Means 比，它允许拉长的椭球，也允许软归属。",
    "gmm",
  ),
  gp: L(
    String.raw`f\sim\mathcal{GP}(m,k),\quad p(f_*\mid X,y,x_*)=\mathcal{N}(\mu_*,\sigma_*^2)`,
    "在函数上做贝叶斯：没数据的地方不确定带宽会变宽。",
    `from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF
gp = GaussianProcessRegressor(kernel=RBF()).fit(X, y)
mu, std = gp.predict(Xs, return_std=True)`,
    "样例：只测了 4 个温度点的反应速率。GP 会画出曲线，并在空白处给出“我没把握”的灰色带子。",
    "均值曲线与不确定带宽",
    "靠近观测点时带子窄，远离时变宽。这是小样本科学实验里的常用代理模型。",
    "gp-band",
  ),
  rf: L(
    String.raw`\hat{y}=\mathrm{vote}\{T_1(x),\dots,T_B(x)\}`,
    "每棵树看随机特征和随机样本，最后投票或平均。用独立性换稳定性。",
    `from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=200, max_features="sqrt").fit(X, y)
print(rf.feature_importances_)`,
    "样例：单棵树把“偶尔出现的邮编”背下来会过拟合；200 棵乱一点的树投票后，这种巧合会被稀释。",
    "多数树投 1，集成就是 1",
    "单棵可以错，森林看多数。这是 Bagging 降方差的现场版。",
    "rf-vote",
  ),
  adaboost: L(
    String.raw`D_{t+1}(i)\propto D_t(i)\exp(\alpha_t \mathbf{1}[h_t(x_i)\ne y_i])`,
    "下一轮专门给上一轮拍错的人加权重。难题会被反复盯。",
    `from sklearn.ensemble import AdaBoostClassifier
AdaBoostClassifier(n_estimators=50).fit(X, y)`,
    "样例：第一棵树总把少数欺诈单判成正常。AdaBoost 把这些单的权重抬高，第二棵树被迫处理它们。",
    "残差下降，集成上升",
    "提升的直觉：每一轮都在修补前面还没修好的误差。",
    "boost",
  ),
  gbdt: L(
    String.raw`F_m(x)=F_{m-1}(x)+\eta\, h_m(x),\quad h_m\approx -\nabla_F L`,
    "新树拟合当前损失的负梯度（残差方向），η 是收缩学习率。",
    `from sklearn.ensemble import GradientBoostingRegressor
GradientBoostingRegressor(learning_rate=0.05, n_estimators=300, max_depth=3).fit(X, y)`,
    "样例：先用一棵浅树粗猜房价，再专门学“还差多少”，一层层把残差啃掉。学习率 0.05 比 1 更稳。",
    "树一棵棵加上去，拟合越来越细",
    "灰线是粗稿，金线是中途，绿线接近真趋势。轮数太多会开始背噪声。",
    "gbdt",
  ),
  xgboost: L(
    String.raw`\mathcal{L}^{(t)}=\sum_i \ell(y_i,\hat{y}_i^{(t-1)}+f_t)+\Omega(f_t)`,
    "在 GBDT 上加二阶导、正则、缺失值处理和工程并行。LightGBM 是它的近亲。",
    `from xgboost import XGBClassifier
XGBClassifier(n_estimators=400, max_depth=5, learning_rate=0.05,
              subsample=0.8, colsample_bytree=0.8).fit(X, y)`,
    "样例：表格竞赛里，先标准化再上神经网络常常不如直接 XGBoost。它吃缺省值、类别编码也省心。",
    "特征对提升的贡献",
    "增益/覆盖/频率是看“哪一列最管用”的三种镜头，不要只看一个。",
    "xgb",
  ),
  kmeans: L(
    String.raw`\mu_j\leftarrow \frac{1}{|C_j|}\sum_{x\in C_j}x,\quad C_j=\{x:\|x-\mu_j\|\le\|x-\mu_{i}\|\}`,
    "指定 K，交替：把点分给最近中心，再把中心挪到该堆平均值。",
    `from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, n_init=10).fit(X)
print(km.cluster_centers_)`,
    "样例：用户按“频次、客单”分成 3 群。中心就是每群的典型画像。K 选不好会把一大群硬劈开。",
    "三堆与三个中心（金点）",
    "它假设簇大致是圆形且大小接近。先标准化，不然工资会统治距离。",
    "kmeans",
  ),
  dbscan: L(
    String.raw`N_\varepsilon(p)=\{q:\|q-p\|\le\varepsilon\},\quad |N_\varepsilon|\ge \mathrm{MinPts}`,
    "密度够就连成一片；连不上的点当噪声。不必预先给 K。",
    `from sklearn.cluster import DBSCAN
DBSCAN(eps=0.4, min_samples=5).fit(X)`,
    "样例：地图上的夜间灯光。连成片的是城区，孤零零的灯是噪声，不必事先说有几个城。",
    "不规则形状 + 灰色噪声点",
    "eps 太小会碎成粉末，太大会粘成一块。密度差很大时会为难。",
    "dbscan",
  ),
  hier: L(
    String.raw`d(A,B)=\min_{a\in A,b\in B}\|a-b\|\quad \text{(单连锁之一)}`,
    "从每个点自己一簇开始不断合并，得到族谱。在不同高度切开就得到不同粒度。",
    `from sklearn.cluster import AgglomerativeClustering
AgglomerativeClustering(n_clusters=4, linkage="ward").fit(X)`,
    "样例：基因相似度。先是个人，再成家庭，再成大家族。你想看“几种病”就在粗层切，想看亚型就在细层切。",
    "合并距离随层级升高",
    "纵轴像族谱上的高度。突然跳高，说明正在合并不太像的两堆。",
    "hier",
  ),
  pca: L(
    String.raw`X\approx U_k\Sigma_k V_k^\top,\quad z=X v_1\ \text{(第一主成分)}`,
    "找方差最大的方向做新坐标。线性降维，可逆到近似重建。",
    `from sklearn.decomposition import PCA
z = PCA(n_components=2).fit_transform(X)`,
    "样例：50 维问卷高度相关。PCA 压成 2 维还能画出散点，第一轴往往是“总体满意度”这种总因子。",
    "数据云与第一主轴",
    "这条线是影子最长的方向。弯弯曲曲的流形它摊不平，那是 t-SNE 的活。",
    "pca",
  ),
  tsne: L(
    String.raw`\min \mathrm{KL}\big(P\|Q\big)\quad P_{ij}\ \text{高维相似},\ Q_{ij}\ \text{低维相似}`,
    "尽量让“原来近的画出来也近”。用来看，不适合当新特征再训练。",
    `from sklearn.manifold import TSNE
z = TSNE(perplexity=30, init="pca").fit_transform(X)`,
    "样例：把 768 维句向量摊成一张图，同类句子抱团。别拿这两维坐标去训分类器当真距离。",
    "高维抱团被摊到平面上",
    "好看不等于科学保留了全局距离。UMAP 更快，思想接近。",
    "tsne",
  ),
  timeseries: L(
    String.raw`x_t = g(x_{t-1},\dots,x_{t-p}, \varepsilon_t)`,
    "顺序本身带信息。打乱时间就等于毁掉问题。划分必须用过去预测未来。",
    `train, test = series[:800], series[800:]
# 错误：随机 shuffle(series)
# 正确：标准化也只用 train 的均值方差`,
    "样例：用电负荷有工作日周期。用未来几天的数据来“预测”今天，成绩会虚高到可笑。",
    "带趋势与季节的序列",
    "上升趋势加上周期性尖峰，是典型业务时序。模型要同时看见这两种结构。",
    "series",
  ),
  arima: L(
    String.raw`(1-\sum_{i=1}^{p}\phi_i L^i)(1-L)^d x_t=(1+\sum_{j=1}^{q}\theta_j L^j)\varepsilon_t`,
    "AR 看过去值，I 差分去趋势，MA 看过去误差。经典单变量基线。",
    `from statsmodels.tsa.arima.model import ARIMA
m = ARIMA(train, order=(1,1,1)).fit()
print(m.forecast(7))`,
    "样例：月销量缓慢上升。先差分变成平稳，再用 ARIMA(1,1,1) 给出未来 7 个月点预测。",
    "历史（蓝）与外推（金）",
    "适合规律较稳的单序列。节假日、促销多时要加回归项或换机器学习。",
    "arima",
  ),
  fft: L(
    String.raw`X(k)=\sum_{n=0}^{N-1}x_n e^{-i 2\pi kn/N}`,
    "把时间里的晃动拆成不同频率的波。擅长回答“里面有哪些节奏”。",
    `import numpy as np
X = np.fft.rfft(signal)
freq = np.fft.rfftfreq(len(signal), d=1/fs)
print(freq[np.argmax(np.abs(X))])`,
    "样例：电机振动里藏着 50Hz 工频。FFT 会在频谱上竖起一根柱子，滤波就能对准它。",
    "频谱能量",
    "它告诉你有哪些音，不太告诉你这个音第几秒出现——那是小波的强项。",
    "fft",
  ),
  wavelet: L(
    String.raw`W(a,b)=\int x(t)\,\psi_{a,b}(t)\,dt,\quad \psi_{a,b}(t)=a^{-1/2}\psi\big(\frac{t-b}{a}\big)`,
    "a 是尺度（粗看/细看），b 是位置。既能看频率，也能看它何时出现。",
    `import pywt
coeffs = pywt.wavedec(signal, "db4", level=4)
# coeffs[0] 近似；后面几层是越来越细的突变`,
    "样例：心电图某一拍突然变形。FFT 只说“有高频”，小波能指出是第 11 秒那一下。去噪时往往只收缩细节系数。",
    "原信号中的尖峰被细节系数抓住",
    "小波常作为特征提取器：提完再交给树或网络去做分类/回归。",
    "wavelet",
  ),
  hmm: L(
    String.raw`p(s_{1:T},x_{1:T})=p(s_1)\prod_t p(s_t\mid s_{t-1})p(x_t\mid s_t)`,
    "状态 s 隐藏，你只看见观测 x。状态按转移矩阵跳，观测按发射概率出。",
    `from hmmlearn.hmm import GaussianHMM
hmm = GaussianHMM(n_components=2).fit(obs)
print(hmm.predict(obs))   # 解码隐藏状态`,
    "样例：只听到邻居脚步。隐藏状态是做饭/睡觉，观测是声音能量。Viterbi 会给出最可能的状态序列。",
    "天气状态转移概率",
    "“晴明天仍晴”的概率 0.7。语音识别经典方法，思想还活在 LSTM 的记忆里。",
    "hmm",
  ),
};
